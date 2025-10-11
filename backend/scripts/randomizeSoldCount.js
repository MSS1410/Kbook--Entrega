import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

import Book from '../src/models/Book.js'

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI
  if (!uri) {
    console.error('❌ Define MONGODB_URI en .env')
    process.exit(1)
  }

  await mongoose.connect(uri)
  console.log('✅ Conectado a Mongo')

  const books = await Book.find({}).select('_id soldCount title')
  if (!books.length) {
    console.log('No hay libros en la colección.')
    await mongoose.disconnect()
    return
  }

  const ops = books.map((b) => ({
    updateOne: {
      filter: { _id: b._id },
      update: { $set: { soldCount: rand(5, 30) } }
    }
  }))

  const res = await Book.bulkWrite(ops)
  console.log(
    `✅ Libros actualizados: ${res.modifiedCount || res.nModified || 0}`
  )

  await mongoose.disconnect()
  console.log('🔌 Desconectado')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
