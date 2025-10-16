import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

router.get('/dashboard', authenticateToken, (req, res) => {
  const nameOrEmail = req.user?.name || req.user?.email || 'User'
  res.json({ 
    message: `Welcome, ${nameOrEmail}!`,
    user: {
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture
    }
  })
})

export default router


