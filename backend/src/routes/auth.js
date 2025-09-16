import express from 'express'
import { register, login } from '../controllers/authController.js'

const router = express.Router()

// Registro de usuario
// POST /api/auth/register
router.post('/register', register)

// Login de usuario
// POST /api/auth/login
router.post('/login', login)

export default router
