import express from 'express'
import { isAuth } from '../middlewares/isAuth.js'
import { isAdmin } from '../middlewares/isAdmin.js'
import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getAuthorsForCarousel
} from '../controllers/authorController.js'

const router = express.Router()

// Rutas públicas
router.get('/', getAllAuthors) // GET /api/authors
router.get('/for-carousel', getAuthorsForCarousel)
router.get('/:id', getAuthorById) // GET /api/authors/:id

// Rutas protegidas (solo admin)
router.post('/', isAuth, isAdmin, createAuthor) // POST /api/authors
router.put('/:id', isAuth, isAdmin, updateAuthor) // PUT  /api/authors/:id
router.delete('/:id', isAuth, isAdmin, deleteAuthor) // DELETE /api/authors/:id

export default router
