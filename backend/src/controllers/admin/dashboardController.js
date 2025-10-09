// backend/src/controllers/admin/dashboardController.js
import User from '../../models/User.js'
import Book from '../../models/Book.js'
import Author from '../../models/Author.js'
import Order from '../../models/Order.js'

export const adminDashboard = async (req, res, next) => {
  try {
    const dayStart = new Date()
    dayStart.setHours(0, 0, 0, 0)
    const doneStatuses = ['paid', 'shipped', 'completed']

    // pedidos de hoy (pagados/en tránsito/completados)
    const [pedidosHoy, ingresosAgg] = await Promise.all([
      Order.countDocuments({
        createdAt: { $gte: dayStart },
        status: { $in: doneStatuses }
      }),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: dayStart },
            status: { $in: doneStatuses }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ])
    ])
    const ingresosHoy = ingresosAgg?.[0]?.total || 0

    // top libros por soldCount (solo con ventas reales)
    const topBooks = await Book.find({ soldCount: { $gt: 0 } })
      .sort({ soldCount: -1, createdAt: -1 })
      .limit(5)
      .select('title coverImage soldCount author')
      .populate('author', 'name')

    // totales (sin tocar)
    const [totalUsuarios, totalLibros, totalAutores, totalPedidos] =
      await Promise.all([
        User.countDocuments(),
        Book.countDocuments(),
        Author.countDocuments(),
        Order.countDocuments()
      ])

    // 💡 ventas totales (todos los pedidos, cualquier estado)
    const salesAllAgg = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 }
        }
      }
    ])
    const salesAll = {
      totalAmount: salesAllAgg?.[0]?.totalAmount || 0,
      totalOrders: salesAllAgg?.[0]?.totalOrders || 0
    }

    res.json({
      pedidosHoy,
      ingresosHoy,
      topBooks,
      totals: {
        usuarios: totalUsuarios,
        libros: totalLibros,
        autores: totalAutores,
        pedidos: totalPedidos
      },
      // 👉 nuevo bloque robusto:
      salesAll
    })
  } catch (err) {
    next(err)
  }
}
