import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import User from '../models/User.js'

dotenv.config()

// Genera un token JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  })
}

// Registro de usuario
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    // Verificar si el usuario ya existe
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: 'Email ya registrado' })
    }
    // Crear usuario
    const user = new User({ name, email, password })
    await user.save()
    // Generar token
    const token = generateToken(user._id)
    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    })
  } catch (err) {
    next(err)
  }
}

// Login de usuario
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    // Verificar usuario
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }
    // Comparar password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }
    // Generar token
    const token = generateToken(user._id)
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    })
  } catch (err) {
    next(err)
  }
}
