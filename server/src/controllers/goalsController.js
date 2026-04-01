import prisma from '../lib/prisma.js'

export async function getGoals(req, res) {
  try {
    const goals = await prisma.savingsGoal.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'asc' },
    })
    res.json({ success: true, data: goals })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function createGoal(req, res) {
  try {
    const data = { ...req.body, userId: req.user.id }
    if (data.deadline) data.deadline = new Date(data.deadline)
    const goal = await prisma.savingsGoal.create({ data })
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
    const data = { ...req.body }
    if (data.deadline) data.deadline = new Date(data.deadline)
    const updated = await prisma.savingsGoal.update({ where: { id: req.params.id }, data })
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
