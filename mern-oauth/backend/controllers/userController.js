import User from '../models/User.js'

export async function getUsers(_req, res) {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    res.json({
      message: 'Users fetched successfully',
      count: users.length,
      users: users.map(u => ({ 
        uid: u.uid, 
        displayName: u.displayName, 
        email: u.email, 
        photoURL: u.photoURL,
        providers: u.providers,
        createdAt: u.createdAt 
      }))
    })
  } catch (err) {
    console.error('Error fetching users:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getUserById(req, res) {
  try {
    const user = await User.findOne({ uid: req.params.uid })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({ 
      message: 'User fetched successfully', 
      user: {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        providers: user.providers,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })
  } catch (err) {
    console.error('Error fetching user:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function deleteUser(req, res) {
  try {
    const user = await User.findOneAndDelete({ uid: req.params.uid })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({ message: 'User deleted successfully', user })
  } catch (err) {
    console.error('Error deleting user:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}


