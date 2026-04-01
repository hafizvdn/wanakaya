import prisma from '../lib/prisma.js'

export async function getCategories(req, res) {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
      orderBy: { name: 'asc' },
    })
    res.json({ success: true, data: categories })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function createCategory(req, res) {
  try {
    const category = await prisma.category.create({
      data: { ...req.body, userId: req.user.id },
    })
    res.status(201).json({ success: true, data: category })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function updateCategory(req, res) {
  try {
    const category = await prisma.category.findUnique({ where: { id: req.params.id } })
    if (!category || category.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Category not found' })
    }
    const updated = await prisma.category.update({ where: { id: req.params.id }, data: req.body })
    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function deleteCategory(req, res) {
  try {
    const category = await prisma.category.findUnique({ where: { id: req.params.id } })
    if (!category || category.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Category not found' })
    }
    await prisma.category.delete({ where: { id: req.params.id } })
    res.json({ success: true, data: null })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}
