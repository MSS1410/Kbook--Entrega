import express from 'express'
import {
  listThreads,
  listThreadMessages,
  userSendMessageToUser,
  startThread,
  searchUsersForMessage
} from '../controllers/messageController.js'

const router = express.Router()

// IMPORTANTE: protege con isAuth desde server.js al montar el router
// app.use('/api/messages', isAuth, messagesRoutes)

router.get('/threads', listThreads)
router.get('/threads/:participantId', listThreadMessages)
router.post('/threads', startThread)
router.post('/threads/:participantId/messages', userSendMessageToUser)

// Buscador de usuarios para iniciar chat
router.get('/users/search', searchUsersForMessage)

export default router
