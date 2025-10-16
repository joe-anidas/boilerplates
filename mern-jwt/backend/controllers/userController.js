import bcrypt from 'bcryptjs'
import User from '../models/User.js'

export async function createUser(req, res) {
  try {
    const { name, email } = req.body
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' })
    }
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }
    const generatedPassword = Math.random().toString(36).slice(2, 10)
    const passwordHash = await bcrypt.hash(generatedPassword, 10)
    const user = new User({ name, email, passwordHash })
    await user.save()
    res.status(201).json({ message: 'User created successfully', user })
  } catch (err) {
    console.error('Error creating user:', err)
    if (err.name === 'ValidationError') {
      res.status(400).json({ error: err.message })
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

export async function getUsers(_req, res) {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    res.json({
      message: 'Users fetched successfully',
      count: users.length,
      users: users.map(u => ({ _id: u._id, name: u.name, email: u.email, createdAt: u.createdAt }))
    })
  } catch (err) {
    console.error('Error fetching users:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getUser(req, res) {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({ message: 'User fetched successfully', user })
  } catch (err) {
    console.error('Error fetching user:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function deleteUser(req, res) {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({ message: 'User deleted successfully', user })
  } catch (err) {
    console.error('Error deleting user:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}


