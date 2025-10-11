// backend/scripts/ensureAdmin.js
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '../src/models/User.js'
dotenv.config()

function reqEnv(name, fallback = '') {
  const v = (process.env[name] || fallback).trim()
  if (!v) {
    console.error(`❌ Falta variable de entorno: ${name}`)
    process.exit(1)
  }
  return v
}

const MONGODB_URI = reqEnv('MONGODB_URI')
const ADMIN_EMAIL = reqEnv('ADMIN_EMAIL', 'kbookhelp@kbook.com')
const ADMIN_PASSWORD = reqEnv('ADMIN_PASSWORD', 'HelpKbook123')

async function run() {
  await mongoose.connect(MONGODB_URI)
  console.log('✅ Conectado a MongoDB')

  // Busca estrictamente por email (normaliza a minúsculas si tu esquema lo hace)
  const email = ADMIN_EMAIL.toLowerCase()

  let user = await User.findOne({ email })

  if (!user) {
    console.log(`ℹ️ No existe admin ${email}. Creando...`)
    user = new User({
      name: 'Admin Kbook',
      email,
      password: ADMIN_PASSWORD, // se hashea en pre('save')
      role: 'admin',
      isBlocked: false
    })
    await user.save()
    console.log(`✅ Admin creado: ${email}`)
  } else {
    let changed = false
    if (user.role !== 'admin') {
      user.role = 'admin'
      changed = true
    }
    if (user.isBlocked) {
      user.isBlocked = false
      changed = true
    }
    // Fuerza nueva contraseña por si la anterior no matchea
    user.password = ADMIN_PASSWORD
    changed = true

    if (changed) {
      await user.save() // dispara hooks -> hash password
      console.log(`✅ Admin actualizado: ${email} (rol, bloqueo y/o password)`)
    } else {
      console.log(`✅ Admin ya estaba correcto: ${email}`)
    }
  }

  await mongoose.disconnect()
  console.log('🔌 Desconectado')
}

run().catch((err) => {
  console.error('❌ Error ensureAdmin:', err)
  process.exit(1)
})
