import express from 'express'
import { isAuth } from '../middlewares/isAuth.js'
import {
  getCart,
  addOrUpdateCart,
  removeCartItem,
  clearCart
} from '../controllers/cartController.js'

const router = express.Router()

router.get('/', isAuth, getCart)
router.post('/', isAuth, addOrUpdateCart) // { bookId, format, quantity }
router.delete('/', isAuth, removeCartItem) // { bookId, format }
router.post('/clear', isAuth, clearCart)

export default router
