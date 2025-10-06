// Mini helpers del perfil (robustos con varios endpoints comunes)
import api from './index'

// Intenta varias rutas comunes para obtener pedidos del usuario (3 últimos)
export async function fetchRecentPurchases() {
  // Cada intento devuelve {orders} o {items}; normalizamos a [{createdAt, books:[{_id,title,coverImage}]}]
  const tryShapes = async (url, params) => {
    const { data } = await api.get(url, { params })
    const raw = Array.isArray(data?.orders)
      ? data.orders
      : Array.isArray(data?.items)
      ? data.items
      : []
    // Normalización de posibles formas:
    // - order.orderItems: [{ book: {_id,title,coverImage} OR bookId, title, image }]
    // - order.items     : idem
    return raw.map((o) => {
      const lines = Array.isArray(o.orderItems)
        ? o.orderItems
        : Array.isArray(o.items)
        ? o.items
        : []
      const books = lines.map((it) => {
        const b = it.book && typeof it.book === 'object' ? it.book : null
        return {
          _id:
            b?._id || it.bookId || it.book || it._id || String(Math.random()),
          title: b?.title || it.title || 'Libro',
          coverImage: b?.coverImage || it.image || it.coverImage || null
        }
      })
      return { createdAt: o.createdAt || o.date || null, books }
    })
  }

  // Intentos (el primero que funcione gana)
  const variants = [
    () => tryShapes('/api/orders/my', { limit: 3, sort: '-createdAt' }),
    () => tryShapes('/api/orders', { mine: 1, limit: 3, sort: '-createdAt' }),
    () => tryShapes('/api/orders', { user: 'me', limit: 3, sort: '-createdAt' })
  ]

  for (const fn of variants) {
    try {
      const arr = await fn()
      // ordenamos desc por fecha, recortamos a 3 y aplanamos a lista de libros recientes
      const ordered = arr
        .sort(
          (a, b) => +new Date(b.createdAt || 0) - +new Date(a.createdAt || 0)
        )
        .slice(0, 3)
      const books = []
      for (const ord of ordered) {
        for (const b of ord.books) {
          if (books.length < 3) books.push(b)
        }
      }
      return books
    } catch (_) {}
  }
  return [] // si ninguna variante funciona, devolvemos vacío
}

// 3 últimos mensajes recibidos (admin → user)
export async function fetchLastInboxMessages(limit = 3) {
  const { data } = await api.get('/api/users/messages', {
    params: { limit, page: 1 }
  })
  const items = Array.isArray(data?.items) ? data.items : []
  // el backend ya ordena por createdAt desc; reforzamos por si acaso
  return items
    .sort((a, b) => +new Date(b.createdAt || 0) - +new Date(a.createdAt || 0))
    .slice(0, limit)
}
