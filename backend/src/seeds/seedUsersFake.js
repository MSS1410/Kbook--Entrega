// mongo, borra users menos admin, crea 30
import dotenv from 'dotenv'
import connectDB from '../config/db.js'
import User from '../models/User.js'
import { faker } from '@faker-js/faker'

dotenv.config()

async function seedUsers() {
  await connectDB()
  console.log('✅ Conectado a MongoDB')

  // elimina usuarios de seed anteriores conservamos admin
  await User.deleteMany({ email: { $ne: ' kbookhelp@kbook.com ' } })
  console.log('🗑️  Usuarios de seed anteriores eliminados (salvo admin)')

  const usersToCreate = 30 // numero de usuarios de prueba
  let created = 0

  for (let i = 0; i < usersToCreate; i++) {
    const name = faker.person.fullName()
    const email = faker.internet.email({ length: 10 }).toLowerCase()
    const password = 'password123' //   puede ser cualquier valor de prueba

    await User.create({ name, email, password, role: 'user' })
    created++
  }

  console.log(`✅ ${created} usuarios de prueba creados`)
  process.exit()
}

seedUsers().catch((err) => {
  console.error('❌ Error en seed-users.js:', err)
  process.exit(1)
})
