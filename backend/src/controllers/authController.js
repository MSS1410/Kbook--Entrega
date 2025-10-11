import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import User from '../models/User.js'

dotenv.config()

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' })

// Registro
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    const existing = await User.findOne({ email })
    if (existing)
      return res.status(400).json({ message: 'Email ya registrado' })

    const user = new User({ name, email, password })
    await user.save()

    const token = generateToken(user._id)
    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        description: user.description
      },
      token
    })
  } catch (err) {
    next(err)
  }
}

// Login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user)
      return res.status(401).json({ message: 'Credenciales inválidas' })

    const isMatch = await user.comparePassword(password)
    if (!isMatch)
      return res.status(401).json({ message: 'Credenciales inválidas' })

    if (user.isBlocked) {
      return res
        .status(403)
        .json({ message: 'Tu cuenta esta bloqueada, Contacta con soporte' })
    }

    // regisrrar ultima cone del usuario
    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

    const token = generateToken(user._id)
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        description: user.description,
        lastLogin: user.lastLogin
      },
      token
    })
  } catch (err) {
    next(err)
  }
}
