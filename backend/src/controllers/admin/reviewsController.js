import Review from '../../models/Review.js'

export const adminListReviews = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1)
    const limit = Number(req.query.limit || 20)
    const skip = (page - 1) * limit
    //paginacion basik

    // aceptare tanto orden como sort para fecha de crracion
    const sortParam = String(
      req.query.order || req.query.sort || 'desc'
    ).toLowerCase()
    const sortDir = sortParam === 'asc' ? 1 : -1

    const userIdParam = req.query.userId || req.query.user
    const bookIdParam = req.query.bookId || req.query.book
    // filtro de usuario o libro
    const filter = {}
    if (userIdParam) filter.user = userIdParam
    if (bookIdParam) filter.book = bookIdParam

    const [items, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: sortDir })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email avatar')
        .populate('book', 'title coverImage')
        .lean(),
      Review.countDocuments(filter)
    ])

    res.json({ items, total, page, limit })
  } catch (err) {
    next(err)
  }
}

export const adminDeleteReview = async (req, res, next) => {
  try {
    const { id } = req.params
    const del = await Review.findByIdAndDelete(id)
    if (!del) return res.status(404).json({ message: 'Reseña no encontrada' })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

export const adminEditReview = async (req, res, next) => {
  try {
    const { id } = req.params
    const { rating, comment } = req.body
    const update = {}
    if (typeof rating !== 'undefined') update.rating = rating
    if (typeof comment !== 'undefined') update.comment = comment

    const edited = await Review.findByIdAndUpdate(id, update, { new: true })
    if (!edited) {
      return res.status(404).json({ message: 'Reseña no encontrada' })
    }
    res.json(edited)
  } catch (err) {
    next(err)
  }
}
