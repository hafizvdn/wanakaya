import prisma from '../lib/prisma.js'

export async function getBudgets(req, res) {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.user.id },
      include: { category: true },
    })
    res.json({ success: true, data: budgets })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function createBudget(req, res) {
  try {
    const budget = await prisma.budget.create({
      data: { ...req.body, userId: req.user.id },
      include: { category: true },
    })
    res.status(201).json({ success: true, data: budget })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function updateBudget(req, res) {
  try {
    const budget = await prisma.budget.findUnique({ where: { id: req.params.id } })
    if (!budget || budget.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Budget not found' })
    }
    const updated = await prisma.budget.update({
      where: { id: req.params.id },
      data: req.body,
      include: { category: true },
    })
    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function deleteBudget(req, res) {
  try {
    const budget = await prisma.budget.findUnique({ where: { id: req.params.id } })
    if (!budget || budget.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Budget not found' })
    }
    await prisma.budget.delete({ where: { id: req.params.id } })
    res.json({ success: true, data: null })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}
