// backend/src/routes/adminRoutes.js
import express from 'express'
import { isAuth } from '../middlewares/isAuth.js'
import { isAdmin } from '../middlewares/isAdmin.js'
import {
  adminDashboard,
  adminCreateBook,
  adminUpdateBook,
  adminDeleteBook,
  adminUpdateBookCover,
  adminToggleBookFeatured,
  adminCreateAuthor,
  adminUpdateAuthor,
  adminDeleteAuthor,
  adminUpdateAuthorPhoto,
  adminToggleAuthorFeatured,
  adminListOrders,
  adminGetOrderById,
  adminUpdateOrderStatus, // usa: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
  adminListReviews,
  adminDeleteReview,
  adminEditReview,
  adminListUsers,
  adminUpdateUser,
  adminDeleteUser,
  adminToggleUserBlock,
  adminUpdateUserRole
} from '../controllers/adminController.js'

const router = express.Router()

router.use(isAuth, isAdmin)

/* Dashboard */
router.get('/dashboard', adminDashboard)

/* Libros */
router.post('/books', adminCreateBook)
router.put('/books/:id', adminUpdateBook)
router.delete('/books/:id', adminDeleteBook)
router.patch('/books/:id/cover', adminUpdateBookCover)
router.patch('/books/:id/featured', adminToggleBookFeatured)

/* Autores */
router.post('/authors', adminCreateAuthor)
router.put('/authors/:id', adminUpdateAuthor)
router.delete('/authors/:id', adminDeleteAuthor)
router.patch('/authors/:id/photo', adminUpdateAuthorPhoto)
router.patch('/authors/:id/featured', adminToggleAuthorFeatured)

/* Pedidos */
router.get('/orders', adminListOrders)
router.get('/orders/:id', adminGetOrderById)
router.patch('/orders/:id/status', adminUpdateOrderStatus)

/* Reseñas */
router.get('/reviews', adminListReviews)
router.patch('/reviews/:id', adminEditReview)
router.delete('/reviews/:id', adminDeleteReview)

/* Usuarios */
router.get('/users', adminListUsers)
router.put('/users/:id', adminUpdateUser)
router.delete('/users/:id', adminDeleteUser)
router.patch('/users/:id/block', adminToggleUserBlock)
router.patch('/users/:id/role', adminUpdateUserRole)

export default router
