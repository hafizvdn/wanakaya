import prisma from '../lib/prisma.js'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

/** Returns the date range for a budget based on its period/month/year. */
function budgetDateRange(budget) {
  const now = new Date()

  if (budget.period === 'WEEKLY') {
    // For weekly budgets without a specific anchor, use the current week
    return {
      gte: startOfWeek(now, { weekStartsOn: 1 }),
      lt: endOfWeek(now, { weekStartsOn: 1 }),
    }
  }

  // MONTHLY
  if (budget.month && budget.year) {
    const start = new Date(budget.year, budget.month - 1, 1)
    const end = new Date(budget.year, budget.month, 1)
    return { gte: start, lt: end }
  }

  // Fallback: current month
  return {
    gte: startOfMonth(now),
    lt: endOfMonth(now),
  }
}

export async function getBudgets(req, res) {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.user.id },
      include: { category: true },
    })

    // Compute spent for each budget in parallel (one aggregate query each)
    const budgetsWithSpent = await Promise.all(
      budgets.map(async b => {
        const dateRange = budgetDateRange(b)

        const agg = await prisma.transaction.aggregate({
          where: {
            userId: req.user.id,
            categoryId: b.categoryId,
            type: 'EXPENSE',
            date: dateRange,
          },
          _sum: { amount: true },
        })

        return { ...b, spent: agg._sum.amount ?? 0 }
      })
    )

    res.json({ success: true, data: budgetsWithSpent })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function createBudget(req, res) {
  try {
    const { categoryId, limitAmount, period, month, year } = req.body
    const budget = await prisma.budget.create({
      data: { categoryId, limitAmount, period, month, year, userId: req.user.id },
      include: { category: true },
    })
    // Return with spent = 0 for a new budget
    res.status(201).json({ success: true, data: { ...budget, spent: 0 } })
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

    const { categoryId, limitAmount, period, month, year } = req.body
    const updated = await prisma.budget.update({
      where: { id: req.params.id },
      data: { categoryId, limitAmount, period, month, year },
      include: { category: true },
    })

    const dateRange = budgetDateRange(updated)
    const agg = await prisma.transaction.aggregate({
      where: { userId: req.user.id, categoryId: updated.categoryId, type: 'EXPENSE', date: dateRange },
      _sum: { amount: true },
    })

    res.json({ success: true, data: { ...updated, spent: agg._sum.amount ?? 0 } })
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