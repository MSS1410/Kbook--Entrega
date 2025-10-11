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

// añadir libro al carrito o act cantidad existente
export const addOrUpdateCart = async (req, res, next) => {
  try {
    //libro con formato y cantidad
    const { bookId, format, quantity = 1 } = req.body
    if (!bookId || !format) {
      return res.status(400).json({ message: 'Faltan datos requeridos' })
    }
    // valido que sin book o formt no se puede continuar
    const book = await Book.findById(bookId)
    if (!book) return res.status(404).json({ message: 'Libro no encontrado' })
    // libro en bd

    const formatObj = book.formats.find((f) => f.type === format)
    if (!formatObj) return res.status(400).json({ message: 'Formato inválido' })
    //busco dentro de libro, el objeto formato

    // localiza el carrito del usuario auth
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      {},
      { upsert: true, new: true } // si no existe carrito, lo crea
    )

    // busco que no exista la combi de libro y formato en carrito
    const existingIndex = cart.items.findIndex(
      (i) => i.book.toString() === bookId && i.format === format
    )

    if (existingIndex !== -1) {
      cart.items[existingIndex].quantity = quantity
      cart.items[existingIndex].price = formatObj.price // snapshot
      cart.items[existingIndex].label = formatObj.label || format
      // si ya estaba:
      //actualiza cantidad nueva, actualizar precio con formato, actualizo label para ver camvios
    } else {
      //sino estaba, inserta nuevo item
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
    // populate para que ningun item traiga datos minimos, titulo portada
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
