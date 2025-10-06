// backend/src/controllers/profileController.js
import User from '../models/User.js'
import Order from '../models/Order.js'
import Book from '../models/Book.js'

// ✅ Normaliza el perfil con forma anidada (canónica) + alias planos (compat)
const shapeUserProfile = (u) => {
  if (!u) return null

  const shipping = u.shipping || {}
  const payment = u.payment || {}
  const last4 = payment.last4 || ''

  const id = String(u._id || u.id || '')

  return {
    _id: id, // ← por compat
    id, // ← el front nuevo usa este
    name: u.name,
    email: u.email,
    avatar: u.avatar || '',
    description: u.description || '',

    // ---- Alias planos (compat antiguo) ----
    address: shipping.address || '',
    city: shipping.city || '',
    postalCode: shipping.postalCode || '',
    country: shipping.country || '',
    holderName: payment.cardHolderName || '',
    expiry: payment.expiry || '',
    cardNumber: last4 ? `•••• •••• •••• ${last4}` : '',

    // ---- Canónico (front nuevo) ----
    shipping: {
      address: shipping.address || '',
      city: shipping.city || '',
      postalCode: shipping.postalCode || '',
      country: shipping.country || ''
    },
    payment: {
      cardHolderName: payment.cardHolderName || '',
      last4,
      expiry: payment.expiry || '',
      cardType: payment.cardType || ''
    },

    createdAt: u.createdAt,
    lastLogin: u.lastLogin
  }
}

// GET /api/users/profile
export const getProfile = async (req, res, next) => {
  try {
    const u = await User.findById(req.user._id).select(
      'name email avatar description shipping payment createdAt lastLogin'
    )
    res.json({ user: shapeUserProfile(u) })
  } catch (err) {
    next(err)
  }
}

// PUT /api/users/profile
export const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      email, // 👈 ahora aceptamos email
      address,
      city,
      postalCode,
      country,
      holderName,
      cardNumber,
      expiry,
      description
    } = req.body

    const u = await User.findById(req.user._id)
    if (!u) return res.status(404).json({ message: 'Usuario no encontrado' })

    // Nombre y descripción
    if (typeof name === 'string') u.name = name
    if (typeof description === 'string') u.description = description

    // 👇 Cambio de email (opcional)
    if (typeof email === 'string' && email.trim()) {
      const newEmail = email.trim().toLowerCase()
      const basicEmailRegex = /.+@.+\..+/
      if (!basicEmailRegex.test(newEmail)) {
        return res.status(400).json({ message: 'Email no válido' })
      }
      if (newEmail !== u.email) {
        const exists = await User.exists({
          email: newEmail,
          _id: { $ne: u._id }
        })
        if (exists) {
          return res.status(409).json({ message: 'Ese email ya está en uso' })
        }
        u.email = newEmail
      }
    }

    // Shipping
    u.shipping = u.shipping || {}
    if (typeof address === 'string') u.shipping.address = address
    if (typeof city === 'string') u.shipping.city = city
    if (typeof postalCode === 'string') u.shipping.postalCode = postalCode
    if (typeof country === 'string') u.shipping.country = country

    // Payment
    u.payment = u.payment || {}
    if (typeof holderName === 'string') u.payment.cardHolderName = holderName
    if (typeof expiry === 'string') u.payment.expiry = expiry
    if (typeof cardNumber === 'string' && cardNumber.trim()) {
      const last4 = cardNumber.replace(/\s+/g, '').slice(-4)
      u.payment.last4 = last4
    }

    await u.save()
    res.json({ user: shapeUserProfile(u) })
  } catch (err) {
    next(err)
  }
}

/**
 * Libros comprados (status=paid)
 */
export const getPurchasedBooks = async (req, res, next) => {
  try {
    const userId = req.user._id
    const orders = await Order.find({ user: userId, status: 'paid' })
      .select('items createdAt')
      .lean()

    const idSet = new Set()
    for (const o of orders)
      for (const it of o.items || []) {
        const id = it?.book?._id ?? it?.book ?? null
        if (id) idSet.add(String(id))
      }
    const bookIds = Array.from(idSet)

    const bookDocs = bookIds.length
      ? await Book.find({ _id: { $in: bookIds } })
          .select('title author coverImage')
          .populate('author', 'name')
          .lean()
      : []

    const bookMap = new Map(bookDocs.map((b) => [String(b._id), b]))

    const flattened = []
    for (const o of orders)
      for (const it of o.items || []) {
        const id = String(it?.book?._id ?? it?.book ?? '')
        if (!id) continue
        const b = bookMap.get(id)
        if (!b) continue
        const authorName =
          typeof b.author === 'string'
            ? b.author
            : b.author?.name || 'Autor desconocido'
        flattened.push({
          _id: id,
          title: b.title,
          author: authorName,
          coverImage: b.coverImage || '',
          cover: b.coverImage || '',
          purchasedAt: o.createdAt
        })
      }

    const byBook = new Map()
    for (const item of flattened) {
      const prev = byBook.get(item._id)
      if (!prev || new Date(item.purchasedAt) > new Date(prev.purchasedAt)) {
        byBook.set(item._id, item)
      }
    }
    const books = Array.from(byBook.values()).sort(
      (a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt)
    )
    res.json({ books })
  } catch (err) {
    next(err)
  }
}

export const changeMyPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {}

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Faltan currentPassword y/o newPassword' })
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      })
    }

    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    const ok = await user.comparePassword(currentPassword)
    if (!ok) {
      return res
        .status(400)
        .json({ message: 'La contraseña actual no es válida' })
    }

    user.password = newPassword
    await user.save()

    return res.json({ message: 'Contraseña actualizada' })
  } catch (err) {
    next(err)
  }
}
