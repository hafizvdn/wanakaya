import { Router } from 'express'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoriesController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { z } from 'zod'

const router = Router()

const categorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['INCOME', 'EXPENSE']),
  icon: z.string().optional(),
})

router.use(requireAuth)
router.get('/', getCategories)
router.post('/', validate(categorySchema), createCategory)
router.put('/:id', validate(categorySchema), updateCategory)
router.delete('/:id', deleteCategory)

export default router
