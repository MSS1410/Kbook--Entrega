// backend/src/models/User.js
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const shippingSchema = new mongoose.Schema(
  {
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  { _id: false }
)

const paymentSchema = new mongoose.Schema(
  {
    cardHolderName: { type: String, default: '' },
    last4: { type: String, default: '' },
    expiry: { type: String, default: '' }, // MM/YY
    cardType: { type: String, default: '' }
  },
  { _id: false }
)

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'El nombre es obligatorio'] },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      match: [/.+@.+\..+/, 'Debe ser un email válido']
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    avatar: {
      type: String,
      default: ''
    },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    shipping: { type: shippingSchema, default: () => ({}) },
    payment: { type: paymentSchema, default: () => ({}) },
    isBlocked: { type: Boolean, default: false }
  },

  {
    timestamps: true
  }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', userSchema)
export default User
