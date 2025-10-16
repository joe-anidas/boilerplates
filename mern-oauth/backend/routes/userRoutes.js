import { Router } from 'express'
import { getUsers, getUserById, deleteUser } from '../controllers/userController.js'

const router = Router()

router.get('/', getUsers)
router.get('/:uid', getUserById)
router.delete('/:uid', deleteUser)

export default router


