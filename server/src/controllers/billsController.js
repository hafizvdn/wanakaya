import prisma from '../lib/prisma.js'

export async function getBills(req, res) {
  try {
    const bills = await prisma.recurringBill.findMany({
      where: { userId: req.user.id },
      orderBy: { dueDay: 'asc' },
    })
    res.json({ success: true, data: bills })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function createBill(req, res) {
  try {
    const bill = await prisma.recurringBill.create({
      data: { ...req.body, userId: req.user.id },
    })
    res.status(201).json({ success: true, data: bill })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function updateBill(req, res) {
  try {
    const bill = await prisma.recurringBill.findUnique({ where: { id: req.params.id } })
    if (!bill || bill.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Bill not found' })
    }
    const updated = await prisma.recurringBill.update({ where: { id: req.params.id }, data: req.body })
    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function deleteBill(req, res) {
  try {
    const bill = await prisma.recurringBill.findUnique({ where: { id: req.params.id } })
    if (!bill || bill.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Bill not found' })
    }
    await prisma.recurringBill.delete({ where: { id: req.params.id } })
    res.json({ success: true, data: null })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}
