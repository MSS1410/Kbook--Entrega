// backend/src/server.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import connectDB from './config/db.js'

// Rutas
import bookRoutes from './routes/books.js'
import authorRoutes from './routes/author.js'
import authRoutes from './routes/auth.js'
import reviewRoutes from './routes/review.js'
import cartRoutes from './routes/cart.js'
import orderRoutes from './routes/orders.js'
import userRoutes from './routes/userRoutes.js'
import searchRoutes from './routes/search.js'
import adminRoutes from './routes/adminRoutes.js'

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

// Rutas principales
app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/authors', authorRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/users', userRoutes)
app.use('/api/search', searchRoutes)

//admin
app.use('/api/admin', adminRoutes)
// Servir archivos estáticos de /uploads
app.use('/uploads', express.static(path.resolve('uploads')))

// Manejador de errores (al final)
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`KBOOKS back listo en http://localhost:${PORT}`)
})
