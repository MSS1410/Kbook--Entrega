// backend/src/seeds/seed-reviews.js
import dotenv from 'dotenv'
import connectDB from '../config/db.js'
import User from '../models/User.js'
import Book from '../models/Book.js'
import Review from '../models/Review.js'
import { faker } from '@faker-js/faker'

dotenv.config()

function randomRecentDate(days = 180) {
  // faker v8
  try {
    return faker.date.recent({ days })
  } catch {
    // fallback simple
    const now = Date.now()
    const past = now - Math.floor(Math.random() * days * 24 * 60 * 60 * 1000)
    return new Date(past)
  }
}

async function seedReviews() {
  await connectDB()
  console.log('✅ Conectado a MongoDB')

  // Limpiar reseñas existentes
  await Review.deleteMany()
  console.log('🗑️  Todas las reseñas eliminadas')

  // Usuarios y libros
  const users = await User.find().select('_id name')
  const books = await Book.find().select('_id title')

  if (!users.length || !books.length) {
    console.error(
      '❌ Debes tener al menos 1 usuario y 1 libro antes de seed-reviews'
    )
    process.exit(1)
  }

  let total = 0
  for (const book of books) {
    // 2–6 reseñas por libro para que haya más material
    const count = faker.number.int({ min: 2, max: 6 })
    const usedForThisBook = new Set()

    for (let i = 0; i < count; i++) {
      // Elige usuario evitando repetir hasta agotar el pool
      let user
      let tries = 0
      do {
        user = faker.helpers.arrayElement(users)
        tries++
        if (tries > 20) break
      } while (usedForThisBook.has(String(user._id)))

      usedForThisBook.add(String(user._id))
      if (usedForThisBook.size >= users.length) usedForThisBook.clear()

      const rating = faker.number.int({ min: 1, max: 5 })
      const comment = faker.lorem.sentences(
        faker.number.int({ min: 1, max: 3 })
      )
      const avatar = faker.image.avatar()
      const createdAt = randomRecentDate(180) // ← fecha aleatoria últimos 180 días

      await Review.create({
        user: user._id,
        book: book._id,
        rating,
        comment,
        avatar,
        createdAt // ← Mongoose respetará este valor aunque tengas timestamps:true
      })
      total++
    }
  }

  console.log(`✅ ${total} reseñas creadas para ${books.length} libros`)
  process.exit()
}

seedReviews().catch((err) => {
  console.error('❌ Error en seed-reviews.js:', err)
  process.exit(1)
})
