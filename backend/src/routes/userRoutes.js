// backend/src/routes/userRoutes.js
import express from 'express'
import { isAuth } from '../middlewares/isAuth.js'
import {
  getProfile,
  updateProfile,
  getPurchasedBooks,
  changeMyPassword
} from '../controllers/profileController.js'
import {
  userListMessages,
  userReadMessage,
  userSendMessageToAdmin
} from '../controllers/messageController.js'

import { uploadAvatar } from '../middlewares/uploadAvatar.js'
import { setAvatar, deleteAvatar } from '../controllers/userAvatarController.js'

const router = express.Router()

// Perfil
router.get('/profile', isAuth, getProfile)
router.put('/profile', isAuth, updateProfile)
router.get('/profile/books', isAuth, getPurchasedBooks)

// Mensajería interna (usuario)
router.get('/messages', isAuth, userListMessages)
router.post('/messages', isAuth, userSendMessageToAdmin)
router.patch('/messages/:id/read', isAuth, userReadMessage)

// Avatar (acepta 'file', 'avatar', etc.)
router.post('/profile/avatar', isAuth, uploadAvatar.any(), setAvatar)
router.delete('/profile/avatar', isAuth, deleteAvatar)

// 🔐 Cambiar contraseña (dos verbos por robustez)
router.patch('/me/password', isAuth, changeMyPassword)
router.post('/me/password', isAuth, changeMyPassword)

export default router
