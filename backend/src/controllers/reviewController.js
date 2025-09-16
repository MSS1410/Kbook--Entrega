// backend/src/controllers/reviewController.js
import Review from '../models/Review.js'
import Order from '../models/Order.js'

// helpers
const countWords = (text = '') =>
  String(text).trim().split(/\s+/).filter(Boolean).length

// Obtener reseñas de un libro (solo ese libro), con user y book poblados
export const getReviewsByBook = async (req, res, next) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId })
      .populate('user', 'name') // nombre del usuario
      .populate({ path: 'book', select: 'title coverImage' }) // título y portada

    console.log(
      `📝 Fetched ${reviews.length} reviews for book ${req.params.bookId}`
    )
    res.json(reviews)
  } catch (err) {
    next(err)
  }
}

// Obtener todas las reseñas (ej. para el home), con user y book poblados
export const getAllReviews = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const sort = req.query.sort || '-createdAt'

    const reviews = await Review.find()
      .sort(sort)
      .limit(limit)
      .populate('user', 'name')
      .populate({ path: 'book', select: 'title coverImage' })

    console.log(`📝 Fetched ${reviews.length} reviews (all)`)
    res.json(reviews)
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

    // ✅ Upsert: si ya existe reseña del mismo user/libro, se actualiza
    const savedReview = await Review.findOneAndUpdate(
      { user: req.user._id, book },
      { rating: r, comment, avatar },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    res.status(201).json(savedReview)
  } catch (err) {
    // si hay índice único y hay carrera, capturará E11000 (duplicate key)
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
