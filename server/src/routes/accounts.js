import { Router } from 'express'
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../controllers/accountsController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { z } from 'zod'

const router = Router()

const accountSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['BANK', 'CASH', 'EWALLET', 'OTHER']),
  balance: z.number().int(),
  icon: z.string().optional(),
})

router.use(requireAuth)
router.get('/', getAccounts)
router.post('/', validate(accountSchema), createAccount)
router.put('/:id', validate(accountSchema.partial()), updateAccount)
router.delete('/:id', deleteAccount)

export default router
