import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getGoals, createGoal, updateGoal, deleteGoal, addContribution, deleteContribution } from '../controllers/goalsController.js'

const router = Router()
router.use(requireAuth)

router.get('/', getGoals)
router.post('/', createGoal)
router.put('/:id', updateGoal)
router.delete('/:id', deleteGoal)

// Contribution sub-resource
router.post('/:id/contributions', addContribution)
router.delete('/:goalId/contributions/:contributionId', deleteContribution)

export default router