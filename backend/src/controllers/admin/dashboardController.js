import User from '../../models/User.js'
import Book from '../../models/Book.js'
import Author from '../../models/Author.js'
import Order from '../../models/Order.js'

export const adminDashboard = async (req, res, next) => {
  try {
    //calculo inicio del dia 00000000 para filtrar pedidos de hoy.
    //defino estados para considerar cerrados o por pagar
    const dayStart = new Date()
    dayStart.setHours(0, 0, 0, 0)
    const doneStatuses = ['paid', 'shipped', 'completed']

    // pedidos de hoy

    const [pedidosHoy, ingresosAgg] = await Promise.all([
      Order.countDocuments({
        createdAt: { $gte: dayStart },
        //$gte filtrar documentos de hoy
        status: { $in: doneStatuses }
        //$in, dentro de este array
      }),
      //count documents para los pedidos de hoy para esos dos estados y aggregate sumara los campos para calcular ingresos del dia
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
    const ingresosHoy = ingresosAgg?.[0]?.total || 0 //total agregado con fallBack a 0 por si no hay resultados

    // top 5 libros con ventas mayor a 0, ordenados por soldCount descendiente.
    const topBooks = await Book.find({ soldCount: { $gt: 0 } })
      .sort({ soldCount: -1, createdAt: -1 })
      .limit(5)
      .select('title coverImage soldCount author')
      .populate('author', 'name')
    //devuelve campos que necesito y resuelve el autor

    // total globales
    const [totalUsuarios, totalLibros, totalAutores, totalPedidos] =
      await Promise.all([
        User.countDocuments(),
        Book.countDocuments(),
        Author.countDocuments(),
        Order.countDocuments()
      ])

    //  ventas historicas, todas las ventas, todos los pedidos en cualqueir estado,
    const salesAllAgg = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 }
        }
      }
    ])
    //total de cantidad y total de numero de pedidos
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
