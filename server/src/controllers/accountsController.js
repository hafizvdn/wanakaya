import prisma from '../lib/prisma.js'

export async function getAccounts(req, res) {
  try {
    const accounts = await prisma.account.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'asc' },
    })
    res.json({ success: true, data: accounts })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function createAccount(req, res) {
  try {
    const account = await prisma.account.create({
      data: { ...req.body, userId: req.user.id },
    })
    res.status(201).json({ success: true, data: account })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function updateAccount(req, res) {
  try {
    const account = await prisma.account.findUnique({ where: { id: req.params.id } })
    if (!account || account.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Account not found' })
    }
    const updated = await prisma.account.update({ where: { id: req.params.id }, data: req.body })
    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function deleteAccount(req, res) {
  try {
    const account = await prisma.account.findUnique({ where: { id: req.params.id } })
    if (!account || account.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Account not found' })
    }
    await prisma.account.delete({ where: { id: req.params.id } })
    res.json({ success: true, data: null })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}
