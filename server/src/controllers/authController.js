import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export async function login(req, res) {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials' })

    const token = signToken(user)
    res.json({ success: true, data: { token, user: { id: user.id, email: user.email, name: user.name } } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function register(req, res) {
  try {
    const { email, password, name } = req.body
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(400).json({ success: false, error: 'Email already registered' })

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({ data: { email, password: hashed, name } })

    const token = signToken(user)
    res.status(201).json({ success: true, data: { token, user: { id: user.id, email: user.email, name: user.name } } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, createdAt: true },
    })
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })
    res.json({ success: true, data: user })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}
