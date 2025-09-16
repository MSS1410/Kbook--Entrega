// backend/src/routes/userRoutes.js
import express from 'express'
import { isAuth } from '../middlewares/isAuth.js'
import {
  getProfile,
  updateProfile,
  getPurchasedBooks
} from '../controllers/profileController.js'
import { upload, uploadAvatar } from '../controllers/avatarController.js'

const router = express.Router()

router.get('/profile', isAuth, getProfile)
router.put('/profile', isAuth, updateProfile)
router.post('/profile/avatar', isAuth, upload.single('avatar'), uploadAvatar)

// NUEVO: libros comprados por el usuario autenticado
router.get('/profile/books', isAuth, getPurchasedBooks)

export default router
