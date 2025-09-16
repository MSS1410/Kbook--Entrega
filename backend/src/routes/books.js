import express from 'express'
import { isAuth } from '../middlewares/isAuth.js'
import { isAdmin } from '../middlewares/isAdmin.js'
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} from '../controllers/bookController.js'

const router = express.Router()

// Rutas públicas
// Obtener todos los libros
router.get('/', getAllBooks)
// Obtener un libro por ID
router.get('/:id', getBookById)

// Rutas protegidas (solo administradores)
// Crear un nuevo libro
router.post('/', isAuth, isAdmin, createBook)
// Actualizar un libro existente
router.put('/:id', isAuth, isAdmin, updateBook)
// Eliminar un libro
router.delete('/:id', isAuth, isAdmin, deleteBook)

export default router
