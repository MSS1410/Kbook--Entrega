import express from 'express'
import { isAuth } from '../middlewares/isAuth.js'
import {
  getReviewsByBook,
  createReview,
  updateReview,
  deleteReview,
  getAllReviews
} from '../controllers/reviewController.js'

const router = express.Router()

// Obtener reseñas de un libro
router.get('/', getAllReviews)

router.get('/book/:bookId', getReviewsByBook)

// Crear reseña (usuarios autenticados)
router.post('/', isAuth, createReview) // POST /api/reviews

// Actualizar reseña (propietario o admin)
router.put('/:id', isAuth, updateReview) // PUT /api/reviews/:id

// Eliminar reseña (propietario o admin)
router.delete('/:id', isAuth, deleteReview) // DELETE /api/reviews/:id

export default router
