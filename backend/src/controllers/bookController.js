import Book from '../models/Book.js'
import Author from '../models/Author.js'
import mongoose from 'mongoose'
const { Types } = mongoose
// Obtiene todos los libros (formats incluidos)
export const getAllBooks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort, category, search } = req.query

    const filter = {}
    if (category) filter.category = new RegExp(`^${category.trim()}$`, 'i')
    if (search) {
      const regex = new RegExp(search, 'i')
      const authors = await Author.find({ name: regex }).select('_id')
      filter.$or = [
        { title: regex },
        { author: { $in: authors.map((a) => a._id) } }
      ]
    }

    const total = await Book.countDocuments(filter)
    const skip = (Number(page) - 1) * Number(limit)
    let query = Book.find(filter)
      .populate('author', 'name')
      .skip(skip)
      .limit(Number(limit))
    if (sort) query = query.sort(sort)

    const books = await query
    res.json({ books, total })
  } catch (err) {
    next(err)
  }
}

// Obtiene un libro por ID incluyendo formats
export const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('author', 'name')
      .exec()
    if (!book) return res.status(404).json({ message: 'Libro no encontrado' })
    res.json(book)
  } catch (err) {
    next(err)
  }
}

// Crear libro con formatos
export const createBook = async (req, res, next) => {
  try {
    const { title, author, synopsis, category, coverImage, formats } = req.body
    const newBook = new Book({
      title,
      author,
      synopsis,
      category,
      coverImage,
      formats
    })
    const savedBook = await newBook.save()
    res.status(201).json(savedBook)
  } catch (err) {
    next(err)
  }
}

// Actualizar libro con formatos
export const updateBook = async (req, res, next) => {
  try {
    const updates = req.body // puede incluir 'formats'
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    })
    if (!updatedBook)
      return res.status(404).json({ message: 'Libro no encontrado' })
    res.json(updatedBook)
  } catch (err) {
    next(err)
  }
}

// Eliminar libro (solo admin)
export const deleteBook = async (req, res, next) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id)
    if (!deleted)
      return res.status(404).json({ message: 'Libro no encontrado' })
    res.json({ message: 'Libro eliminado correctamente' })
  } catch (err) {
    next(err)
  }
}
