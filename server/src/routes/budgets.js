import { Router } from 'express'
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../controllers/budgetsController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { z } from 'zod'

const router = Router()

const budgetSchema = z.object({
  categoryId: z.string().cuid(),
  limitAmount: z.number().int().positive(),
  period: z.enum(['MONTHLY', 'WEEKLY']),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().optional(),
})

router.use(requireAuth)
router.get('/', getBudgets)
router.post('/', validate(budgetSchema), createBudget)
router.put('/:id', validate(budgetSchema.partial()), updateBudget)
router.delete('/:id', deleteBudget)

export default router
