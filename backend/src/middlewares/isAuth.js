// backend/src/middlewares/isAuth.js
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const isAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return res.status(401).json({ message: 'No token' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select(
      'name email role isBlocked'
    )
    if (!user) return res.status(401).json({ message: 'Usuario no encontrado' })

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Tu cuenta está bloqueada.' })
    }

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' })
  }
}
