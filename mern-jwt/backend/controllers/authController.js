import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { signJwt } from '../middleware/auth.js'

export async function register(req, res) {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' })
    }
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }
    const passwordHash = await bcrypt.hash(password, 10)
    const user = new User({ name, email, passwordHash })
    await user.save()
    const token = signJwt({ userId: user._id, email: user.email, name: user.name })
    return res.status(201).json({
      message: 'Registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    })
  } catch (err) {
    console.error('Error registering user:', err)
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message })
    }
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const token = signJwt({ userId: user._id, email: user.email, name: user.name })
    return res.json({
      message: 'Logged in successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    })
  } catch (err) {
    console.error('Error logging in:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}


