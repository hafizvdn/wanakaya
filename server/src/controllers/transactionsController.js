import prisma from '../lib/prisma.js'

/** Balance delta to apply to an account given a transaction type and amount. */
function balanceDelta(type, amount) {
  return type === 'INCOME' ? amount : -amount
}

export async function getTransactions(req, res) {
  try {
    const { month, year, categoryId, type } = req.query
    const where = { userId: req.user.id }

    if (type) where.type = type
    if (categoryId) where.categoryId = categoryId

    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1)
      const end = new Date(Number(year), Number(month), 1)
      where.date = { gte: start, lt: end }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true, account: true },
      orderBy: { date: 'desc' },
    })
    res.json({ success: true, data: transactions })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function createTransaction(req, res) {
  try {
    const { accountId, type, amount, categoryId, note, date } = req.body

    const result = await prisma.$transaction(async tx => {
      const transaction = await tx.transaction.create({
        data: {
          amount,
          type,
          categoryId,
          accountId: accountId ?? null,
          note: note ?? null,
          date: new Date(date),
          userId: req.user.id,
        },
        include: { category: true, account: true },
      })

      if (accountId) {
        await tx.account.update({
          where: { id: accountId },
          data: { balance: { increment: balanceDelta(type, amount) } },
        })
      }

      return transaction
    })

    res.status(201).json({ success: true, data: result })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function updateTransaction(req, res) {
  try {
    const existing = await prisma.transaction.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Transaction not found' })
    }

    const incoming = req.body
    const newType = incoming.type ?? existing.type
    const newAmount = incoming.amount ?? existing.amount
    const newAccountId = 'accountId' in incoming ? (incoming.accountId ?? null) : existing.accountId
    const newDate = incoming.date ? new Date(incoming.date) : existing.date

    const result = await prisma.$transaction(async tx => {
      // Reverse the old transaction's effect on the old account
      if (existing.accountId) {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: -balanceDelta(existing.type, existing.amount) } },
        })
      }

      const transaction = await tx.transaction.update({
        where: { id: req.params.id },
        data: {
          amount: newAmount,
          type: newType,
          categoryId: incoming.categoryId ?? existing.categoryId,
          accountId: newAccountId,
          note: incoming.note ?? existing.note,
          date: newDate,
        },
        include: { category: true, account: true },
      })

      // Apply the new transaction's effect on the new account
      if (newAccountId) {
        await tx.account.update({
          where: { id: newAccountId },
          data: { balance: { increment: balanceDelta(newType, newAmount) } },
        })
      }

      return transaction
    })

    res.json({ success: true, data: result })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function deleteTransaction(req, res) {
  try {
    const transaction = await prisma.transaction.findUnique({ where: { id: req.params.id } })
    if (!transaction || transaction.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Transaction not found' })
    }

    await prisma.$transaction(async tx => {
      await tx.transaction.delete({ where: { id: req.params.id } })

      if (transaction.accountId) {
        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: -balanceDelta(transaction.type, transaction.amount) } },
        })
      }
    })

    res.json({ success: true, data: null })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}
