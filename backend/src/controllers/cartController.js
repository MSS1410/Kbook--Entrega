import Cart from '../models/Cart.js'
import Book from '../models/Book.js'

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.book',
      select: 'title coverImage formats'
    })
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] })
    }
    res.json(cart)
  } catch (err) {
    next(err)
  }
}

// Añadir o actualizar item
export const addOrUpdateCart = async (req, res, next) => {
  try {
    const { bookId, format, quantity = 1 } = req.body
    if (!bookId || !format) {
      return res.status(400).json({ message: 'Faltan datos requeridos' })
    }

    const book = await Book.findById(bookId)
    if (!book) return res.status(404).json({ message: 'Libro no encontrado' })

    const formatObj = book.formats.find((f) => f.type === format)
    if (!formatObj) return res.status(400).json({ message: 'Formato inválido' })

    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      {},
      { upsert: true, new: true }
    )

    // buscar si ya existe esa combinación book+format
    const existingIndex = cart.items.findIndex(
      (i) => i.book.toString() === bookId && i.format === format
    )

    if (existingIndex !== -1) {
      cart.items[existingIndex].quantity = quantity
      cart.items[existingIndex].price = formatObj.price // actualiza snapshot
      cart.items[existingIndex].label = formatObj.label || format
    } else {
      cart.items.push({
        book: bookId,
        format: formatObj.type,
        label: formatObj.label || formatObj.type,
        price: formatObj.price,
        quantity
      })
    }

    await cart.save()
    const populated = await cart.populate({
      path: 'items.book',
      select: 'title coverImage'
    })
    res.json(populated)
  } catch (err) {
    next(err)
  }
}

export const removeCartItem = async (req, res, next) => {
  try {
    const { bookId, format } = req.body
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' })

    cart.items = cart.items.filter(
      (i) => !(i.book.toString() === bookId && i.format === format)
    )
    await cart.save()
    const populated = await cart.populate({
      path: 'items.book',
      select: 'title coverImage'
    })
    res.json(populated)
  } catch (err) {
    next(err)
  }
}

export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [] },
      { new: true }
    )
    res.json(cart)
  } catch (err) {
    next(err)
  }
}
