// ================================
// File: backend/src/controllers/authorController.js
// ================================
import Author from '../models/Author.js'
import mongoose from 'mongoose'

// Obtiene todos los autores
// Obtiene todos los autores (ahora con opciones de búsqueda, filtro y libros)
export const getAllAuthors = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10))
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit || '10', 10))
    )
    const skip = (page - 1) * limit

    const q = (req.query.q || '').trim()
    const hasBooks = req.query.hasBooks === '1'

    const match = {}
    if (q) match.name = { $regex: q, $options: 'i' }

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'books', // colección de libros
          localField: '_id',
          foreignField: 'author',
          as: 'books'
        }
      },
      {
        $addFields: {
          booksCount: { $size: '$books' },
          // Deja sólo lo que necesitamos de los libros y ordénalos por título
          books: {
            $map: {
              input: {
                $sortArray: { input: '$books', sortBy: { title: 1 } }
              },
              as: 'b',
              in: {
                _id: '$$b._id',
                title: '$$b.title',
                coverImage: '$$b.coverImage'
              }
            }
          }
        }
      },
      ...(hasBooks ? [{ $match: { booksCount: { $gt: 0 } } }] : []),
      { $sort: { name: 1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: 'count' }]
        }
      }
    ]

    const agg = await Author.aggregate(pipeline)
    const authors = agg[0]?.data || []
    const total = agg[0]?.total?.[0]?.count || 0

    // Mantenemos una respuesta clara para front
    res.json({ authors, total, page, limit })
  } catch (err) {
    next(err)
  }
}

// Obtiene un autor por ID (opcionalmente con libros)
export const getAuthorById = async (req, res, next) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id)
    const author = await Author.aggregate([
      { $match: { _id: id } },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: 'author',
          as: 'books'
        }
      },
      {
        $addFields: {
          books: {
            $map: {
              input: { $sortArray: { input: '$books', sortBy: { title: 1 } } },
              as: 'b',
              in: {
                _id: '$$b._id',
                title: '$$b.title',
                coverImage: '$$b.coverImage'
              }
            }
          }
        }
      }
    ])

    if (!author?.[0]) {
      return res.status(404).json({ message: 'Autor no encontrado' })
    }

    res.json(author[0])
  } catch (err) {
    next(err)
  }
}

// === NUEVO: autores para carrusel del home (nombre + foto, con libros) ===
export const getAuthorsForCarousel = async (req, res, next) => {
  try {
    const limit = Math.min(
      24,
      Math.max(1, parseInt(req.query.limit || '12', 10))
    )

    const pipeline = [
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: 'author',
          as: 'books'
        }
      },
      { $addFields: { booksCount: { $size: '$books' } } },
      { $match: { booksCount: { $gt: 0 } } },
      { $project: { name: 1, photo: 1 } },
      { $sort: { name: 1 } },
      { $limit: limit }
    ]

    const authors = await Author.aggregate(pipeline)
    res.json({ authors })
  } catch (err) {
    next(err)
  }
}

// Crea un nuevo autor (solo admin)
export const createAuthor = async (req, res, next) => {
  try {
    const { name, biography, photo } = req.body
    const newAuthor = new Author({ name, biography, photo })
    const savedAuthor = await newAuthor.save()
    res.status(201).json(savedAuthor)
  } catch (err) {
    next(err)
  }
}

// Actualiza un autor existente (solo admin)
export const updateAuthor = async (req, res, next) => {
  try {
    const updates = req.body
    const updatedAuthor = await Author.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    )
    if (!updatedAuthor) {
      return res.status(404).json({ message: 'Autor no encontrado' })
    }
    res.json(updatedAuthor)
  } catch (err) {
    next(err)
  }
}

// Elimina un autor (solo admin)
export const deleteAuthor = async (req, res, next) => {
  try {
    const deletedAuthor = await Author.findByIdAndDelete(req.params.id)
    if (!deletedAuthor) {
      return res.status(404).json({ message: 'Autor no encontrado' })
    }
    res.json({ message: 'Autor eliminado correctamente' })
  } catch (err) {
    next(err)
  }
}
