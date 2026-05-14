import prisma from '../lib/prisma.js'

export async function getGoals(req, res) {
  try {
    const goals = await prisma.savingsGoal.findMany({
      where: { userId: req.user.id },
      include: {
        contributions: {
          orderBy: { date: 'desc' },
          take: 10, // latest 10 contributions per goal for the history panel
        },
      },
      orderBy: { createdAt: 'asc' },
    })
    res.json({ success: true, data: goals })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function createGoal(req, res) {
  try {
    const { name, targetAmount, deadline } = req.body
    const data = { name, targetAmount, userId: req.user.id }
    if (deadline) data.deadline = new Date(deadline)
    const goal = await prisma.savingsGoal.create({
      data,
      include: { contributions: true },
    })
    res.status(201).json({ success: true, data: goal })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function updateGoal(req, res) {
  try {
    const goal = await prisma.savingsGoal.findUnique({ where: { id: req.params.id } })
    if (!goal || goal.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Goal not found' })
    }
    const { name, targetAmount, deadline } = req.body
    const data = { name, targetAmount }
    if ('deadline' in req.body) data.deadline = deadline ? new Date(deadline) : null
    const updated = await prisma.savingsGoal.update({
      where: { id: req.params.id },
      data,
      include: { contributions: { orderBy: { date: 'desc' }, take: 10 } },
    })
    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function deleteGoal(req, res) {
  try {
    const goal = await prisma.savingsGoal.findUnique({ where: { id: req.params.id } })
    if (!goal || goal.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Goal not found' })
    }
    await prisma.savingsGoal.delete({ where: { id: req.params.id } })
    res.json({ success: true, data: null })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/goals/:id/contributions
 * Body: { amount: number (sen, positive=deposit negative=withdrawal), note?: string, date?: string }
 * Atomically creates the contribution and updates savedAmount on the goal.
 */
export async function addContribution(req, res) {
  try {
    const goal = await prisma.savingsGoal.findUnique({ where: { id: req.params.id } })
    if (!goal || goal.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Goal not found' })
    }

    const { amount, note, date } = req.body
    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ success: false, error: 'amount (integer sen) is required' })
    }

    const newSaved = goal.savedAmount + amount
    if (newSaved < 0) {
      return res.status(400).json({ success: false, error: 'Withdrawal would bring saved amount below zero' })
    }

    const result = await prisma.$transaction(async tx => {
      const contribution = await tx.goalContribution.create({
        data: {
          goalId: goal.id,
          userId: req.user.id,
          amount,
          note: note ?? null,
          date: date ? new Date(date) : new Date(),
        },
      })

      const updated = await tx.savingsGoal.update({
        where: { id: goal.id },
        data: { savedAmount: newSaved },
        include: { contributions: { orderBy: { date: 'desc' }, take: 10 } },
      })

      return updated
    })

    res.status(201).json({ success: true, data: result })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/goals/:goalId/contributions/:contributionId
 * Reverses the contribution and adjusts savedAmount.
 */
export async function deleteContribution(req, res) {
  try {
    const contribution = await prisma.goalContribution.findUnique({
      where: { id: req.params.contributionId },
    })
    if (!contribution || contribution.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Contribution not found' })
    }

    const goal = await prisma.savingsGoal.findUnique({ where: { id: req.params.goalId } })
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' })

    const newSaved = goal.savedAmount - contribution.amount
    if (newSaved < 0) {
      return res.status(400).json({ success: false, error: 'Reversing this contribution would bring saved amount below zero' })
    }

    const result = await prisma.$transaction(async tx => {
      await tx.goalContribution.delete({ where: { id: contribution.id } })
      return tx.savingsGoal.update({
        where: { id: goal.id },
        data: { savedAmount: newSaved },
        include: { contributions: { orderBy: { date: 'desc' }, take: 10 } },
      })
    })

    res.json({ success: true, data: result })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}