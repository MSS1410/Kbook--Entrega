import Author from '../models/Author.js'
import Book from '../models/Book.js'

export const searchBooks = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim()
    const limit = Math.min(parseInt(req.query.limit || '8', 10), 20)
    if (!q) return res.json({ books: [] })

    // construyo expresion con q: texto buscado, "i": ignora mayus minus
    const regex = new RegExp(q, 'i')

    const authors = await Author.find({ name: regex }).select('_id')
    // uso el regex para encontrar author seleccionar id

    const books = await Book.find({
      $or: [{ title: regex }, { author: { $in: authors.map((a) => a._id) } }]
    })
    //encuentro el libro por titulo o author.
      .select('title coverImage author')
      .populate('author', 'name')
      .limit(limit)
      .lean()
    // devuelvo busqueda
    res.json({ books })
  } catch (err) {
    next(err)
  }
}
