import express from 'express'
import { isAuth } from '../middlewares/isAuth.js'
import {
  createOrder,
  getMyOrders,
  getOrderById,
  markOrderPaid
} from '../controllers/oorderController.js'

const router = express.Router()

// ⚠️ El orden importa:
router.get('/my', isAuth, getMyOrders) // primero
router.post('/', isAuth, createOrder)
router.patch('/:id/pay', isAuth, markOrderPaid) // antes de '/:id'

router.get('/:id', isAuth, getOrderById)

export default router
