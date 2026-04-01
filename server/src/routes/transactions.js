import { Router } from 'express'
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../controllers/transactionsController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { z } from 'zod'

const router = Router()

const transactionSchema = z.object({
  amount: z.number().int().positive(),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.string().cuid(),
  accountId: z.string().cuid().optional().nullable(),
  note: z.string().optional(),
  date: z.string().datetime(),
})

router.use(requireAuth)
router.get('/', getTransactions)
router.post('/', validate(transactionSchema), createTransaction)
router.put('/:id', validate(transactionSchema.partial()), updateTransaction)
router.delete('/:id', deleteTransaction)

export default router
