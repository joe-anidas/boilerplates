import { Router } from 'express'
import { saveUser, getUser } from '../controllers/authController.js'

const router = Router()

router.post('/users', saveUser)
router.get('/users/:uid', getUser)

export default router


