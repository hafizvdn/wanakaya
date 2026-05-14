import prisma from '../lib/prisma.js'

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
      include: { category: true, account: true, toAccount: true },
      orderBy: { date: 'desc' },
    })
    res.json({ success: true, data: transactions })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function createTransaction(req, res) {
  try {
    const { accountId, toAccountId, type, amount, categoryId, note, date } = req.body

    // TRANSFER: debit from accountId, credit toAccountId, no category
    if (type === 'TRANSFER') {
      if (!accountId || !toAccountId) {
        return res.status(400).json({ success: false, error: 'Transfer requires both from and to accounts' })
      }
      if (accountId === toAccountId) {
        return res.status(400).json({ success: false, error: 'Cannot transfer to the same account' })
      }

      const result = await prisma.$transaction(async tx => {
        const transaction = await tx.transaction.create({
          data: {
            amount,
            type: 'TRANSFER',
            categoryId: null,
            accountId,
            toAccountId,
            note: note ?? null,
            date: new Date(date),
            userId: req.user.id,
          },
          include: { account: true, toAccount: true },
        })
        // Debit source
        await tx.account.update({
          where: { id: accountId },
          data: { balance: { decrement: amount } },
        })
        // Credit destination
        await tx.account.update({
          where: { id: toAccountId },
          data: { balance: { increment: amount } },
        })
        return transaction
      })

      return res.status(201).json({ success: true, data: result })
    }

    // INCOME / EXPENSE
    const result = await prisma.$transaction(async tx => {
      const transaction = await tx.transaction.create({
        data: {
          amount,
          type,
          categoryId: categoryId ?? null,
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
    const newToAccountId = 'toAccountId' in incoming ? (incoming.toAccountId ?? null) : existing.toAccountId
    const newDate = incoming.date ? new Date(incoming.date) : existing.date

    const result = await prisma.$transaction(async tx => {
      // Reverse old effects
      if (existing.type === 'TRANSFER') {
        if (existing.accountId) await tx.account.update({ where: { id: existing.accountId }, data: { balance: { increment: existing.amount } } })
        if (existing.toAccountId) await tx.account.update({ where: { id: existing.toAccountId }, data: { balance: { decrement: existing.amount } } })
      } else {
        if (existing.accountId) {
          await tx.account.update({
            where: { id: existing.accountId },
            data: { balance: { increment: -balanceDelta(existing.type, existing.amount) } },
          })
        }
      }

      const transaction = await tx.transaction.update({
        where: { id: req.params.id },
        data: {
          amount: newAmount,
          type: newType,
          categoryId: newType === 'TRANSFER' ? null : (incoming.categoryId ?? existing.categoryId),
          accountId: newAccountId,
          toAccountId: newType === 'TRANSFER' ? newToAccountId : null,
          note: incoming.note ?? existing.note,
          date: newDate,
        },
        include: { category: true, account: true, toAccount: true },
      })

      // Apply new effects
      if (newType === 'TRANSFER') {
        if (newAccountId) await tx.account.update({ where: { id: newAccountId }, data: { balance: { decrement: newAmount } } })
        if (newToAccountId) await tx.account.update({ where: { id: newToAccountId }, data: { balance: { increment: newAmount } } })
      } else {
        if (newAccountId) {
          await tx.account.update({
            where: { id: newAccountId },
            data: { balance: { increment: balanceDelta(newType, newAmount) } },
          })
        }
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

      if (transaction.type === 'TRANSFER') {
        if (transaction.accountId) await tx.account.update({ where: { id: transaction.accountId }, data: { balance: { increment: transaction.amount } } })
        if (transaction.toAccountId) await tx.account.update({ where: { id: transaction.toAccountId }, data: { balance: { decrement: transaction.amount } } })
      } else {
        if (transaction.accountId) {
          await tx.account.update({
            where: { id: transaction.accountId },
            data: { balance: { increment: -balanceDelta(transaction.type, transaction.amount) } },
          })
        }
      }
    })

    res.json({ success: true, data: null })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}