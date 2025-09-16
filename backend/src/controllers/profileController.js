// backend/src/controllers/profileController.js
import User from '../models/User.js'
import Order from '../models/Order.js'
import Book from '../models/Book.js'

// Obtener perfil
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      'name email avatar address city postalCode country cardNumber expiry holderName'
    )
    res.json({ user })
  } catch (err) {
    next(err)
  }
}

// Actualizar perfil
export const updateProfile = async (req, res, next) => {
  try {
    const updates = req.body
    const allowed = [
      'name',
      'address',
      'city',
      'postalCode',
      'country',
      'cardNumber',
      'expiry',
      'holderName'
    ]
    const data = {}
    for (const k of allowed) if (updates[k] !== undefined) data[k] = updates[k]

    const user = await User.findByIdAndUpdate(req.user._id, data, {
      new: true,
      runValidators: true
    }).select(
      'name email avatar address city postalCode country cardNumber expiry holderName role'
    )
    res.json({ user })
  } catch (err) {
    next(err)
  }
}

/**
 * Libros comprados (status=paid)
 * Responde: { books: [{ _id, title, author, coverImage, cover, purchasedAt }], _debug? }
 */
export const getPurchasedBooks = async (req, res, next) => {
  try {
    const debug = req.query.debug === '1'
    const userId = req.user._id

    // 1) Órdenes 'paid' del usuario (sin populate para no perder campos)
    const orders = await Order.find({ user: userId, status: 'paid' })
      .select('items createdAt')
      .lean()

    // 2) IDs únicos de libro
    const idSet = new Set()
    for (const o of orders) {
      for (const it of o.items || []) {
        const id = it?.book?._id ?? it?.book ?? null
        if (id) idSet.add(String(id))
      }
    }
    const bookIds = Array.from(idSet)

    // 3) Cargar libros (traer title, author y coverImage)
    const bookDocs = bookIds.length
      ? await Book.find({ _id: { $in: bookIds } })
          .select('title author coverImage')
          .populate('author', 'name')
          .lean()
      : []

    const bookMap = new Map(bookDocs.map((b) => [String(b._id), b]))

    // 4) Aplanar compras
    const flattened = []
    for (const o of orders) {
      for (const it of o.items || []) {
        const id = String(it?.book?._id ?? it?.book ?? '')
        if (!id) continue
        const b = bookMap.get(id)
        if (!b) continue

        const authorName =
          typeof b.author === 'string'
            ? b.author
            : b.author?.name || 'Autor desconocido'

        const coverImage = b.coverImage || '' // ⬅️ TU campo real

        flattened.push({
          _id: id,
          title: b.title,
          author: authorName,
          coverImage, // canónico
          cover: coverImage, // compat para front antiguo
          purchasedAt: o.createdAt
        })
      }
    }

    // 5) Deduplicar por libro quedándote con la compra más reciente
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

    const payload = { books }
    if (debug) {
      payload._debug = {
        ordersCount: orders.length,
        uniqueBookIds: bookIds,
        booksFound: bookDocs.map((b) => ({
          _id: String(b._id),
          title: b.title,
          author: typeof b.author === 'string' ? b.author : b.author?.name,
          coverImage: b.coverImage
        })),
        sample: books[0] || null
      }
    }

    res.json(payload)
  } catch (err) {
    next(err)
  }
}
