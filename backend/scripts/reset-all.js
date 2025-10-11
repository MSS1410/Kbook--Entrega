import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from '../src/config/db.js'

import User from '../src/models/User.js'
import Book from '../src/models/Book.js'
import Author from '../src/models/Author.js'
import Review from '../src/models/Review.js'
import Order from '../src/models/Order.js'
import Message from '../src/models/Message.js'
import Cart from '../src/models/Cart.js'

dotenv.config()

async function resetAll() {
  await connectDB()
  console.log('✅ Conectado a MongoDB')

  const adminEmail = process.env.ADMIN_EMAIL || 'kbookhelp@kbook.com'

  // 1) Guardar admin
  const admin = await User.findOne({ email: adminEmail })
  if (!admin) {
    console.error(
      `❌ Admin ${adminEmail} no existe. Define ADMIN_EMAIL/ADMIN_PASSWORD y crea el admin en seeds.`
    )
    process.exit(1)
  }

  // 2) Limpiar colecciones
  await Promise.all([
    Author.deleteMany({}),
    Book.deleteMany({}),
    Review.deleteMany({}),
    Order.deleteMany({}),
    Message.deleteMany({}),
    Cart.deleteMany({}),
    User.deleteMany({ email: { $ne: adminEmail } })
  ])

  console.log('🧹 DB limpia (se preservó el admin)')

  await mongoose.connection.close()
  console.log('🔌 Conexión cerrada')
  process.exit(0)
}

resetAll().catch((err) => {
  console.error('❌ Error en reset-all:', err)
  process.exit(1)
})
