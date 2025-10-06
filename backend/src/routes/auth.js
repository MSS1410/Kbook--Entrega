import express from 'express'
import { register, login } from '../controllers/authController.js'
import { changeMyPassword } from '../controllers/profileController.js'
import { isAuth } from '../middlewares/isAuth.js'
const router = express.Router()

// Registro de usuario
// POST /api/auth/register
router.post('/register', register)

// Login de usuario
// POST /api/auth/login
router.post('/login', login)

router.patch('/change-password', isAuth, changeMyPassword)
router.post('/change-password', isAuth, changeMyPassword)
export default router
