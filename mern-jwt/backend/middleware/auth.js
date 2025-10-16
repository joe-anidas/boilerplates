import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/env.js'

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Missing token' })
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function signJwt(payload, options = { expiresIn: '1h' }) {
  return jwt.sign(payload, JWT_SECRET, options)
}


