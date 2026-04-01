import { Router } from 'express'
import { login, register, me } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { z } from 'zod'

const router = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const registerSchema = loginSchema.extend({
  name: z.string().optional(),
})

router.post('/login', validate(loginSchema), login)
router.post('/register', validate(registerSchema), register)
router.get('/me', requireAuth, me)

export default router
