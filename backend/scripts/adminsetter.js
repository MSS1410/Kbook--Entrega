// BACKend/scripts/promote-admin.js
import 'dotenv/config'
import mongoose from 'mongoose'
import User from '../src/models/User.js' // ajusta la ruta a tu modelo

const email = process.argv[2]
if (!email) {
  console.error('Uso: node scripts/adminsetter.js <email>')
  process.exit(1)
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI)
  const user = await User.findOne({ email })
  if (!user) {
    console.error('Usuario no encontrado:', email)
    process.exit(1)
  }

  // Cambia una de estas dos líneas según tu chequeo de admin
  user.role = 'admin' // <- si usas roles
  // user.isAdmin = true               // <- si usas booleano

  await user.save()
  console.log('Seteado a admin:', email)
  await mongoose.disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
