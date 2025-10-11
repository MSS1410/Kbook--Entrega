import Order from '../../models/Order.js'

export const adminListOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, order, userId } = req.query

    const filter = {}
    if (status) filter.status = status
    if (userId) filter.user = userId
    //leo filtros y paginacion desde query. userId, me permite ver pedidos de un usuario

    const skip = (Number(page) - 1) * Number(limit)
    const sortDir = String(order || 'desc').toLowerCase() === 'asc' ? 1 : -1
    //calculo pag y direccion de orden por createdAt

    const [items, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: sortDir })
        .skip(skip)
        .limit(Number(limit))
        // necesito el avatar usuario y primera cover image del pedido
        .populate('user', 'name email avatar')
        .populate({
          path: 'items.book',
          select: 'title coverImage'
        })
        .lean(),
      // devuelvo objetos planos con lean
      Order.countDocuments(filter)
    ])

    res.json({ items, total, page: Number(page), limit: Number(limit) })
  } catch (err) {
    next(err)
  }
}

export const adminGetOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email avatar')
      .populate({
        path: 'items.book',
        select: 'title coverImage'
      })
      .lean()

    if (!order) return res.status(404).json({ message: 'Orden no encontrada' })
    res.json(order)
  } catch (err) {
    next(err)
  }
}

export const adminUpdateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const valid = ['pending', 'paid', 'shipped', 'completed', 'cancelled']
    if (!valid.includes(status))
      return res.status(400).json({ message: 'Estado inválido' })

    const updated = await Order.findByIdAndUpdate(id, { status }, { new: true })
    if (!updated)
      return res.status(404).json({ message: 'Orden no encontrada' })
    res.json(updated)
  } catch (err) {
    next(err)
  }
}
