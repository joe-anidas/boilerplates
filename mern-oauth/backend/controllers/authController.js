import User from '../models/User.js'

export async function saveUser(req, res) {
  try {
    const { uid, email, displayName, photoURL, providers } = req.body
    
    if (!uid || !email) {
      return res.status(400).json({ error: 'UID and email are required' })
    }

    const updateData = {
      email,
      updatedAt: new Date()
    }

    if (displayName) updateData.displayName = displayName
    if (photoURL) updateData.photoURL = photoURL
    if (providers && Array.isArray(providers)) {
      updateData.$addToSet = { providers: { $each: providers } }
    }

    const result = await User.updateOne(
      { uid },
      {
        $set: updateData,
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    )

    const user = await User.findOne({ uid })
    
    return res.status(200).json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        providers: user.providers
      },
      isNewUser: !!result.upsertedId
    })
  } catch (err) {
    console.error('Error saving user:', err)
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message })
    }
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getUser(req, res) {
  try {
    const { uid } = req.params
    
    const user = await User.findOne({ uid })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      providers: user.providers,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })
  } catch (err) {
    console.error('Error fetching user:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}


