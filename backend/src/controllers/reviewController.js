import Review from '../models/Review.js'
import Order from '../models/Order.js'

// helpers
const countWords = (text = '') =>
  String(text).trim().split(/\s+/).filter(Boolean).length

// obtener reseñas de un libro ,solo de ese libro , necesito teneer  user(name,avatar) y book(title,coverImage)
export const getReviewsByBook = async (req, res, next) => {
  try {
    //hasPaging, detecta si cliente tiene paginacion con page o limit, si no necesita, reseñas simples, si necesita, paginacion.

    const hasPaging = 'page' in req.query || 'limit' in req.query

    //normalizo page y limit 1-50
    const page = Math.max(1, parseInt(req.query.page || '1', 10))
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit || '10', 10))
    )
    const skip = (page - 1) * limit

    // base query para que encuentre las reviews del libro, las ordene por creacion, las rellene con los datos del usuario + datos del libro
    const baseQuery = Review.find({ book: req.params.bookId })
      .sort(req.query.sort || '-createdAt')
      .populate('user', 'name avatar')
      .populate({ path: 'book', select: 'title coverImage' })
    // consulta de base reusable, reseñas de libro -> /books/:bookId/reviews
    //orden por defecto -createdAt
    //populate user trae nombre y avatar, book title cover
    if (!hasPaging) {
      const reviews = await baseQuery.exec()
      return res.json(reviews)
    }
    // sin paginacion

    const [items, total] = await Promise.all([
      baseQuery.skip(skip).limit(limit).exec(),
      Review.countDocuments({ book: req.params.bookId })
    ])
    // items, pagina pedida sobre baseQuery, total, cuenta de reseñas para poder paginar o no.
    // promise all, reduce tiempo de res
    res.json({ items, total, page, limit })
  } catch (err) {
    next(err)
  }
}

// Obtener todas las reseñas (listado global), con user(name,avatar) y book(title,coverImage)
export const getAllReviews = async (req, res, next) => {
  try {
    const hasPaging = 'page' in req.query || 'limit' in req.query
    const page = Math.max(1, parseInt(req.query.page || '1', 10))
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit || '10', 10))
    )
    const skip = (page - 1) * limit
    const sort = req.query.sort || '-createdAt'

    const baseQuery = Review.find()
      .sort(sort)
      .populate('user', 'name avatar')
      .populate({ path: 'book', select: 'title coverImage' })

    if (!hasPaging) {
      const reviews = await baseQuery
        .limit(parseInt(req.query.limit || '10', 10))
        .exec()
      return res.json(reviews)
    }

    const [items, total] = await Promise.all([
      baseQuery.skip(skip).limit(limit).exec(),
      Review.countDocuments({})
    ])

    res.json({ items, total, page, limit })
  } catch (err) {
    next(err)
  }
}

// Crear/actualizar reseña (solo usuarios autenticados que COMPRARON el libro)
export const createReview = async (req, res, next) => {
  try {
    const { book, rating, comment = '', avatar } = req.body

    if (!book || !rating)
      return res.status(400).json({ message: 'book y rating son requeridos.' })

    const r = parseInt(rating, 10)
    if (Number.isNaN(r) || r < 1 || r > 5)
      return res.status(400).json({ message: 'rating debe estar entre 1 y 5.' })

    if (countWords(comment) > 50)
      return res
        .status(400)
        .json({ message: 'La reseña debe tener máximo 50 palabras.' })

    // ✅ Verificar compra (órdenes pagadas que contengan el libro)
    const purchased = await Order.exists({
      user: req.user._id,
      status: 'paid',
      'items.book': book
    })
    if (!purchased) {
      return res
        .status(403)
        .json({ message: 'Solo puedes reseñar libros que compraste.' })
    }

    // ✅ Upsert
    const saved = await Review.findOneAndUpdate(
      { user: req.user._id, book },
      { rating: r, comment, avatar },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    const populated = await Review.findById(saved._id)
      .populate('user', 'name avatar')
      .populate({ path: 'book', select: 'title coverImage' })

    res.status(201).json(populated)
  } catch (err) {
    next(err)
  }
}

export const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review)
      return res.status(404).json({ message: 'Reseña no encontrada' })
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res
        .status(403)
        .json({ message: 'No tienes permiso para editar esta reseña' })
    }
    const updates = req.body
    if (updates.comment && countWords(updates.comment) > 50) {
      return res
        .status(400)
        .json({ message: 'La reseña debe tener máximo 50 palabras.' })
    }
    if (updates.rating) {
      const r = parseInt(updates.rating, 10)
      if (Number.isNaN(r) || r < 1 || r > 5)
        return res
          .status(400)
          .json({ message: 'rating debe estar entre 1 y 5.' })
    }

    const updated = await Review.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    })
      .populate('user', 'name avatar')
      .populate({ path: 'book', select: 'title coverImage' })

    res.json(updated)
  } catch (err) {
    next(err)
  }
}

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review)
      return res.status(404).json({ message: 'Reseña no encontrada' })
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res
        .status(403)
        .json({ message: 'No tienes permiso para eliminar esta reseña' })
    }
    await Review.findByIdAndDelete(req.params.id)
    res.json({ message: 'Reseña eliminada correctamente' })
  } catch (err) {
    next(err)
  }
}
