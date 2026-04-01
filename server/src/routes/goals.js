import { Router } from 'express'
import { getGoals, createGoal, updateGoal, deleteGoal } from '../controllers/goalsController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { z } from 'zod'

const router = Router()

const goalSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().int().positive(),
  savedAmount: z.number().int().min(0).optional(),
  deadline: z.string().datetime().optional(),
})

router.use(requireAuth)
router.get('/', getGoals)
router.post('/', validate(goalSchema), createGoal)
router.put('/:id', validate(goalSchema.partial()), updateGoal)
router.delete('/:id', deleteGoal)

export default router
