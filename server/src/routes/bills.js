import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getBills, createBill, updateBill, deleteBill, markPaid, markUnpaid } from '../controllers/billsController.js'

const router = Router()
router.use(requireAuth)

router.get('/', getBills)
router.post('/', createBill)
router.put('/:id', updateBill)
router.delete('/:id', deleteBill)

// Payment status
router.patch('/:id/paid', markPaid)
router.patch('/:id/unpaid', markUnpaid)

export default router