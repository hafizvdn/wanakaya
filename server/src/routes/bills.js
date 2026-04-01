import { Router } from 'express'
import { getBills, createBill, updateBill, deleteBill } from '../controllers/billsController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { z } from 'zod'

const router = Router()

const billSchema = z.object({
  name: z.string().min(1),
  amount: z.number().int().positive(),
  dueDay: z.number().int().min(1).max(28),
  icon: z.string().optional(),
})

router.use(requireAuth)
router.get('/', getBills)
router.post('/', validate(billSchema), createBill)
router.put('/:id', validate(billSchema.partial()), updateBill)
router.delete('/:id', deleteBill)

export default router
