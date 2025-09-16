import Order from '../models/Order.js'
import Cart from '../models/Cart.js'

/**
 * Crea una orden a partir del carrito del usuario autenticado.
 * Deja la orden en 'pending'. El paso a 'paid' lo hace markOrderPaid.
 */
export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body

    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.book',
      select: 'title coverImage formats'
    })

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Carrito vacío' })
    }

    // Recalcula totals por seguridad
    let totalPrice = 0
    const orderItems = cart.items.map((i) => {
      totalPrice += i.price * i.quantity
      return {
        book: i.book._id,
        format: i.format,
        label: i.label,
        price: i.price,
        quantity: i.quantity
      }
    })

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'placeholder',
      totalPrice,
      status: 'pending'
    })

    // Vaciar carrito
    cart.items = []
    await cart.save()

    res.status(201).json(order)
  } catch (err) {
    next(err)
  }
}

/**
 * Confirma el pago de una orden del usuario → pasa a 'paid'
 */
export const markOrderPaid = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!order) return res.status(404).json({ message: 'Orden no encontrada' })

    if (order.status === 'paid') {
      return res.json(order) // idempotente
    }

    if (order.status !== 'pending') {
      return res
        .status(400)
        .json({
          message: `No se puede pagar una orden con estado "${order.status}"`
        })
    }

    order.status = 'paid'
    await order.save()
    res.json(order)
  } catch (err) {
    next(err)
  }
}

/**
 * Mis órdenes (del usuario actual)
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({ path: 'items.book', select: 'title coverImage' })
      .sort('-createdAt')
    res.json(orders)
  } catch (err) {
    next(err)
  }
}

/**
 * Detalle de orden (solo dueño)
 */
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.book', 'title coverImage')
      .populate('user', 'name email')

    if (!order) return res.status(404).json({ message: 'Orden no encontrada' })

    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' })
    }

    res.json(order)
  } catch (err) {
    next(err)
  }
}
