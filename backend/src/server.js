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

// Uploads admin
import adminCoverRoutes from './routes/admin/adminCover.js'
import adminAuthorPhotoRoutes from './routes/admin/adminAuthorPhoto.js'
import adminUserAvatarRoutes from './routes/admin/adminUserAvatar.js'

// Precarga de modelos (si hay hooks/indexes)
import './models/Author.js'
import './models/Book.js'
import './models/User.js'

dotenv.config()
connectDB()

const app = express()

app.use(cors())

app.use(express.json())

// Archivos estáticos
app.use('/uploads', express.static(path.resolve('uploads')))

// Rutas públicas
app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/authors', authorRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/users', userRoutes)
app.use('/api/search', searchRoutes)

// ===================== MENSAJES =====================
// Unificar TODO bajo el router (evita duplicaciones)
// (el router ya debe proteger internamente o aquí con isAuth)
app.use('/api/messages', isAuth, messagesRoutes)

// ===================== ADMIN =====================
// Routers de admin (uploads especializados + admin principal)
app.use('/api/admin', adminCoverRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/admin', adminAuthorPhotoRoutes)
app.use('/api/admin', adminUserAvatarRoutes)

// Error handler (incluye Multer)
app.use((err, req, res, _next) => {
  if (err && err.name === 'MulterError') {
    return res.status(400).json({ message: err.message })
  }
  if (err && /Tipo de archivo no permitido/i.test(err.message || '')) {
    return res.status(400).json({ message: err.message })
  }
  const status = err.status || 500
  res.status(status).json({ message: err.message || 'Error interno' })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`KBOOKS back listo en http://localhost:${PORT}`)
})
