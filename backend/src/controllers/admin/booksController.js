import Book from '../../models/Book.js'
import Author from '../../models/Author.js'

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

export const adminUpdateBook = async (req, res, next) => {
  try {
    const { id } = req.params
    const update = req.body || {}

    if (update.author) {
      const exists = await Author.exists({ _id: update.author })
      if (!exists) return res.status(400).json({ message: 'Autor no válido' })
    }

    const book = await Book.findByIdAndUpdate(id, update, { new: true })
    if (!book) return res.status(404).json({ message: 'Libro no encontrado' })
    res.json(book)
  } catch (err) {
    next(err)
  }
}

export const adminDeleteBook = async (req, res, next) => {
  try {
    const { id } = req.params
    const del = await Book.findByIdAndDelete(id)
    if (!del) return res.status(404).json({ message: 'Libro no encontrado' })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

// lo tengo duplicado para evitar que se me rompan usuarios antiguos previos , funcionalidad cubierta por adminCoverController
export const adminUpdateBookCover = async (req, res, next) => {
  try {
    const { id } = req.params
    const { coverImage } = req.body

    const book = await Book.findByIdAndUpdate(
      id,
      { coverImage: coverImage || '' },
      { new: true }
    ).select('_id title coverImage')

    if (!book) return res.status(404).json({ message: 'Libro no encontrado' })
    res.json(book)
  } catch (err) {
    next(err)
  }
}

export const adminToggleBookFeatured = async (req, res, next) => {
  try {
    const { id } = req.params
    const book = await Book.findById(id)
    if (!book) return res.status(404).json({ message: 'Libro no encontrado' })
    book.featured = !book.featured
    await book.save()
    res.json({ _id: book._id, featured: book.featured })
  } catch (err) {
    next(err)
  }
}
