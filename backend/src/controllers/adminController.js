// backend/src/controllers/adminController.js
import mongoose from 'mongoose'
import User from '../models/User.js'
import Book from '../models/Book.js'
import Author from '../models/Author.js'
import Order from '../models/Order.js'
import Review from '../models/Review.js'

import crypto from 'crypto'

/* ========== Helpers ========== */
const startOfToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/* ============================================================
 * 1) DASHBOARD (métricas rápidas)
 *    GET /api/admin/dashboard
 *    - pedidosHoy (paid/shipped/completed)
 *    - ingresosHoy (∑ totalPrice)
 *    - topBooks (por soldCount)
 *    - totales (usuarios, libros, autores, pedidos)
 * ============================================================ */
export const adminDashboard = async (req, res, next) => {
  try {
    const dayStart = new Date()
    dayStart.setHours(0, 0, 0, 0)
    const doneStatuses = ['paid', 'shipped', 'completed']

    // pedidos de hoy (pagados/en tránsito/completados)
    const [pedidosHoy, ingresosAgg] = await Promise.all([
      Order.countDocuments({
        createdAt: { $gte: dayStart },
        status: { $in: doneStatuses }
      }),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: dayStart },
            status: { $in: doneStatuses }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ])
    ])
    const ingresosHoy = ingresosAgg?.[0]?.total || 0

    // top libros por soldCount (solo con ventas reales)
    const topBooks = await Book.find({ soldCount: { $gt: 0 } })
      .sort({ soldCount: -1, createdAt: -1 })
      .limit(5)
      .select('title coverImage soldCount author')
      .populate('author', 'name')

    // totales (sin tocar)
    const [totalUsuarios, totalLibros, totalAutores, totalPedidos] =
      await Promise.all([
        User.countDocuments(),
        Book.countDocuments(),
        Author.countDocuments(),
        Order.countDocuments()
      ])

    // 💡 ventas totales (todos los pedidos, cualquier estado)
    const salesAllAgg = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 }
        }
      }
    ])
    const salesAll = {
      totalAmount: salesAllAgg?.[0]?.totalAmount || 0,
      totalOrders: salesAllAgg?.[0]?.totalOrders || 0
    }

    res.json({
      pedidosHoy,
      ingresosHoy,
      topBooks,
      totales: {
        usuarios: totalUsuarios,
        libros: totalLibros,
        autores: totalAutores,
        pedidos: totalPedidos
      },
      // 👉 nuevo bloque robusto:
      salesAll
    })
  } catch (err) {
    next(err)
  }
}

/* ============================================================
 * 2) LIBROS (CRUD + featured + portada por URL)
 * ============================================================ */

// POST /api/admin/books
export const adminCreateBook = async (req, res, next) => {
  try {
    const { title, author, synopsis, category, coverImage, formats, featured } =
      req.body

    const exists = await Author.exists({ _id: author })
    if (!exists) return res.status(400).json({ message: 'Autor no válido' })

    const book = await Book.create({
      title,
      author,
      synopsis,
      category,
      coverImage: coverImage || '',
      formats: Array.isArray(formats) ? formats : [],
      featured: !!featured,
      soldCount: 0
    })

    res.status(201).json(book)
  } catch (err) {
    next(err)
  }
}

// PUT /api/admin/books/:id
export const adminUpdateBook = async (req, res, next) => {
  try {
    const updates = { ...req.body }

    if (updates.author) {
      const ok = await Author.exists({ _id: updates.author })
      if (!ok) return res.status(400).json({ message: 'Autor no válido' })
    }

    const updated = await Book.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('author', 'name')

    if (!updated)
      return res.status(404).json({ message: 'Libro no encontrado' })
    res.json(updated)
  } catch (err) {
    next(err)
  }
}

// DELETE /api/admin/books/:id
export const adminDeleteBook = async (req, res, next) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id)
    if (!deleted)
      return res.status(404).json({ message: 'Libro no encontrado' })
    // (opcional) borrar reseñas del libro:
    // await Review.deleteMany({ book: req.params.id })
    res.json({ message: 'Libro eliminado' })
  } catch (err) {
    next(err)
  }
}

// PATCH /api/admin/books/:id/cover    { coverImage: 'https://...' }
export const adminUpdateBookCover = async (req, res, next) => {
  try {
    const { coverImage } = req.body
    if (!coverImage)
      return res.status(400).json({ message: 'coverImage requerido' })
    const updated = await Book.findByIdAndUpdate(
      req.params.id,
      { coverImage },
      { new: true }
    )
    if (!updated)
      return res.status(404).json({ message: 'Libro no encontrado' })
    res.json(updated)
  } catch (err) {
    next(err)
  }
}

// PATCH /api/admin/books/:id/featured  { value: boolean }
export const adminToggleBookFeatured = async (req, res, next) => {
  try {
    const { value } = req.body
    const book = await Book.findById(req.params.id)
    if (!book) return res.status(404).json({ message: 'Libro no encontrado' })
    book.featured = typeof value === 'boolean' ? value : !book.featured
    await book.save()
    res.json({ _id: book._id, featured: book.featured })
  } catch (err) {
    next(err)
  }
}

/* ============================================================
 * 3) AUTORES (CRUD + featured + foto por URL)
 * ============================================================ */

export const adminCreateAuthor = async (req, res, next) => {
  try {
    const { name, biography, photo, featured } = req.body
    const a = await Author.create({
      name,
      biography: biography || '',
      photo: photo || '',
      featured: !!featured
    })
    res.status(201).json(a)
  } catch (err) {
    next(err)
  }
}

export const adminUpdateAuthor = async (req, res, next) => {
  try {
    const updates = { ...req.body }
    const updated = await Author.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    })
    if (!updated)
      return res.status(404).json({ message: 'Autor no encontrado' })
    res.json(updated)
  } catch (err) {
    next(err)
  }
}

export const adminDeleteAuthor = async (req, res, next) => {
  try {
    const deleted = await Author.findByIdAndDelete(req.params.id)
    if (!deleted)
      return res.status(404).json({ message: 'Autor no encontrado' })
    res.json({ message: 'Autor eliminado' })
  } catch (err) {
    next(err)
  }
}

export const adminUpdateAuthorPhoto = async (req, res, next) => {
  try {
    const { photo } = req.body
    if (!photo) return res.status(400).json({ message: 'photo requerido' })
    const updated = await Author.findByIdAndUpdate(
      req.params.id,
      { photo },
      { new: true }
    )
    if (!updated)
      return res.status(404).json({ message: 'Autor no encontrado' })
    res.json(updated)
  } catch (err) {
    next(err)
  }
}

export const adminToggleAuthorFeatured = async (req, res, next) => {
  try {
    const { value } = req.body
    const a = await Author.findById(req.params.id)
    if (!a) return res.status(404).json({ message: 'Autor no encontrado' })
    a.featured = typeof value === 'boolean' ? value : !a.featured
    await a.save()
    res.json({ _id: a._id, featured: a.featured })
  } catch (err) {
    next(err)
  }
}

/* ============================================================
 * 4) PEDIDOS (listar, detalle, cambiar status)
 * ============================================================ */

// GET /api/admin/orders?page=&limit=&order=asc|desc
// También soporta: ?sort=createdAt | ?sort=-createdAt
// GET /api/admin/orders?page=&limit=&order=asc|desc&userId=&bookId=
export const adminListOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10))
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit || '20', 10))
    )
    const skip = (page - 1) * limit

    // Orden: order=asc|desc tiene prioridad; si no, admite sort=createdAt|-createdAt
    let sortDir = -1
    const orderParam = (req.query.order || '').toString().toLowerCase()
    if (orderParam === 'asc') sortDir = 1
    if (orderParam === 'desc') sortDir = -1
    if (!orderParam) {
      const sortQ = (req.query.sort || '').toString()
      if (sortQ === 'createdAt') sortDir = 1
      if (sortQ === '-createdAt') sortDir = -1
    }

    // 🔎 FILTROS
    const { userId, bookId } = req.query
    const filter = {}
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.user = userId
    }
    if (bookId && mongoose.Types.ObjectId.isValid(bookId)) {
      filter['items.book'] = bookId
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: sortDir })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email avatar')
        .populate('items.book', 'title coverImage'),
      Order.countDocuments(filter)
    ])

    res.json({ orders, total, page, limit })
  } catch (err) {
    next(err)
  }
}

// GET /api/admin/orders/:id
export const adminGetOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.book', 'title coverImage')
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' })
    res.json(order)
  } catch (err) {
    next(err)
  }
}

// PATCH /api/admin/orders/:id/status  { status: 'pending'|'paid'|'shipped'|'completed'|'cancelled' }
export const adminUpdateOrderStatus = async (req, res, next) => {
  try {
    const allowed = ['pending', 'paid', 'shipped', 'completed', 'cancelled']
    const { status } = req.body
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'status inválido' })
    }
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    if (!updated)
      return res.status(404).json({ message: 'Pedido no encontrado' })
    res.json(updated)
  } catch (err) {
    next(err)
  }
}

/* ============================================================
 * 5) RESEÑAS (listar + eliminar + (opcional) editar)
 * ============================================================ */

// GET /api/admin/reviews?userId=&bookId=&order=asc|desc&page=&limit=
export const adminListReviews = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10))
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit || '20', 10))
    )
    const skip = (page - 1) * limit

    const { userId, bookId } = req.query
    const orderParam = String(req.query.order || 'desc').toLowerCase()
    const sortDir = orderParam === 'asc' ? 1 : -1

    const filter = {}
    // Filtrar por usuario (si viene y es un ObjectId válido)
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.user = userId
    }
    // Filtrar por libro (si viene y es un ObjectId válido)
    if (bookId && mongoose.Types.ObjectId.isValid(bookId)) {
      filter.book = bookId
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: sortDir })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email avatar')
        .populate('book', 'title coverImage'),
      Review.countDocuments(filter)
    ])

    res.json({ reviews, total, page, limit })
  } catch (err) {
    next(err)
  }
}

export const adminDeleteReview = async (req, res, next) => {
  try {
    const r = await Review.findByIdAndDelete(req.params.id)
    if (!r) return res.status(404).json({ message: 'Reseña no encontrada' })
    res.json({ message: 'Reseña eliminada' })
  } catch (err) {
    next(err)
  }
}

export const adminEditReview = async (req, res, next) => {
  try {
    const updates = {}
    if (typeof req.body.comment === 'string') updates.comment = req.body.comment
    if (typeof req.body.rating !== 'undefined') updates.rating = req.body.rating

    const r = await Review.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    })
    if (!r) return res.status(404).json({ message: 'Reseña no encontrada' })
    res.json(r)
  } catch (err) {
    next(err)
  }
}

/* ============================================================
 * 6) USUARIOS (listar, actualizar, eliminar, bloquear, rol)
 * ============================================================ */

export const adminListUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10))
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit || '20', 10))
    )
    const skip = (page - 1) * limit
    const q = (req.query.q || '').trim()

    const filter = {}
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          'name email role isBlocked createdAt avatar description lastLogin'
        ),
      User.countDocuments(filter)
    ])

    res.json({ users, total, page, limit })
  } catch (err) {
    next(err)
  }
}

export const adminUpdateUser = async (req, res, next) => {
  try {
    const { name, email, description, avatar } = req.body
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })

    // email único (si cambia)
    if (email && email.toLowerCase() !== user.email) {
      const exists = await User.exists({ email: email.toLowerCase() })
      if (exists) {
        return res.status(409).json({ message: 'Ese email ya está en uso' })
      }
      user.email = email.toLowerCase()
    }

    if (typeof name === 'string' && name.trim()) user.name = name.trim()
    if (typeof description === 'string') user.description = description
    // opcional: si alguna vez decides pasar avatar por PUT, lo contemplamos
    if (typeof avatar === 'string' && avatar.trim()) user.avatar = avatar.trim()

    await user.save()

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
      avatar: user.avatar,
      description: user.description
    })
  } catch (err) {
    next(err)
  }
}

export const adminDeleteUser = async (req, res, next) => {
  try {
    const target = await User.findById(req.params.id)
    if (!target)
      return res.status(404).json({ message: 'Usuario no encontrado' })

    if (String(target._id) === String(req.user._id)) {
      return res
        .status(400)
        .json({ message: 'No puedes eliminar tu propia cuenta' })
    }

    if (target.role === 'admin') {
      const otherAdmins = await User.countDocuments({
        role: 'admin',
        _id: { $ne: target._id }
      })
      if (otherAdmins === 0) {
        return res
          .status(400)
          .json({ message: 'No puedes eliminar al último administrador' })
      }
    }

    // ✅ Anonimización + bloqueo (soft delete)
    const surrogateEmail = `deleted+${target._id}@example.invalid`
    const randomPwd = crypto.randomBytes(24).toString('hex')

    target.name = 'Usuario eliminado'
    target.email = surrogateEmail
    target.password = randomPwd // se re-hashea por el pre('save')
    target.avatar = ''
    target.description = ''
    target.firstName = ''
    target.lastName = ''
    target.shipping = {}
    target.payment = {}
    target.isBlocked = true
    target.role = 'user'
    target.isDeleted = true // si añadiste el campo
    target.lastLogin = undefined

    await target.save()

    // (opcional) marcar mensajes como leídos o añadir un flag, si tu UI lo necesita
    // await Message.updateMany({ fromUser: target._id }, { $set: { fromUserDeleted: true } })

    res.json({ message: 'Usuario anonimizado y acceso revocado' })
  } catch (err) {
    next(err)
  }
}

export const adminToggleUserBlock = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('isBlocked')
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })

    if (String(user._id) === String(req.user._id)) {
      return res
        .status(400)
        .json({ message: 'No puedes bloquear tu propia cuenta' })
    }

    const { value } = req.body
    user.isBlocked = typeof value === 'boolean' ? value : !user.isBlocked
    await user.save()
    res.json({ _id: user._id, isBlocked: user.isBlocked })
  } catch (err) {
    next(err)
  }
}

export const adminUpdateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'role inválido' })
    }

    const user = await User.findById(req.params.id).select('role')
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })

    if (String(user._id) === String(req.user._id) && role !== 'admin') {
      return res
        .status(400)
        .json({ message: 'No puedes quitarte el rol de admin a ti mismo' })
    }

    if (user.role === 'admin' && role !== 'admin') {
      const otherAdmins = await User.countDocuments({
        role: 'admin',
        _id: { $ne: user._id }
      })
      if (otherAdmins === 0) {
        return res
          .status(400)
          .json({ message: 'No puedes quitar el rol al último administrador' })
      }
    }

    user.role = role
    await user.save()
    res.json({ _id: user._id, role: user.role })
  } catch (err) {
    next(err)
  }
}
