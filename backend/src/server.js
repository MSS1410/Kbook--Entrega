// backend/src/server.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import connectDB from './config/db.js'

import { isAuth } from './middlewares/isAuth.js'

// Rutas varias
import bookRoutes from './routes/books.js'
import authorRoutes from './routes/author.js'
import authRoutes from './routes/auth.js'
import reviewRoutes from './routes/review.js'
import cartRoutes from './routes/cart.js'
import orderRoutes from './routes/orders.js'
import userRoutes from './routes/userRoutes.js'
import searchRoutes from './routes/search.js'
import adminRoutes from './routes/adminRoutes.js'

// Mensajes
import messagesRoutes from './routes/messages.js'

// ⬇️ NUEVO: router de subida de portadas
import adminCoverRoutes from './routes/admin/adminCover.js'

import adminAuthorPhotoRoutes from './routes/admin/adminAuthorPhoto.js'
import adminUserAvatarRoutes from './routes/admin/adminUserAvatar.js'
// Controladores directos de mensajes
import {
  listThreads,
  listThreadMessages,
  userSendMessageToUser,
  startThread,
  searchUsersForMessage
} from './controllers/messageController.js'

// Precarga de modelos
import './models/Author.js'
import './models/Book.js'
import './models/User.js'

dotenv.config()
connectDB()

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

// Archivos estáticos (¡antes de rutas por si devuelves imágenes!)
app.use('/uploads', express.static(path.resolve('uploads')))

// Rutas principales públicas
app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/authors', authorRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/users', userRoutes)
app.use('/api/search', searchRoutes)

// ===================== MENSAJES =====================
console.log('[server] ¿existe messagesRoutes?', !!messagesRoutes)

app.use(
  '/api/messages',
  isAuth,
  (req, _res, next) => {
    console.log('[server] hit /api/messages →', req.method, req.url)
    next()
  },
  messagesRoutes
)

// Endpoints directos (mensajes)
app.get('/api/messages/threads', isAuth, listThreads)
app.get('/api/messages/threads/:participantId', isAuth, listThreadMessages)
app.post('/api/messages/threads', isAuth, startThread)
app.post(
  '/api/messages/threads/:participantId/messages',
  isAuth,
  userSendMessageToUser
)
app.get('/api/messages/users/search', isAuth, searchUsersForMessage)

// Catch-all mensajes
app.use('/api/messages', (req, res) => {
  console.warn('[server] /api/messages no matcheado →', req.method, req.url)
  res.status(404).json({
    message: 'No match en /api/messages',
    method: req.method,
    url: req.url
  })
})

// ===================== ADMIN =====================
// ⬇️ montar router de portadas (POST /api/admin/books/:id/cover y GET /api/admin/_ping_covers)
console.log('[server] montando /api/admin (covers)')
app.use('/api/admin', adminCoverRoutes)

console.log('[server] montando /api/admin')
app.use('/api/admin', adminRoutes)

console.log('[server] montando /api/admin (author photos)')
app.use('/api/admin', adminAuthorPhotoRoutes)

console.log('[server] montando /api/admin (user avatar)')
app.use('/api/admin', adminUserAvatarRoutes)

// Error handler (incluye Multer)
app.use((err, req, res, next) => {
  if (err && err.name === 'MulterError') {
    console.error('[multer]', err)
    return res.status(400).json({ message: err.message })
  }
  if (err && /Tipo de archivo no permitido/i.test(err.message || '')) {
    console.error('[multer-filter]', err)
    return res.status(400).json({ message: err.message })
  }
  console.error(err)
  res.status(err.status || 500).json({ message: err.message })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`KBOOKS back listo en http://localhost:${PORT}`)
})
