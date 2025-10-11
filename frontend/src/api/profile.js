import api from './index'

// quiero sacar los ultimos 3 pedidos del usuario
export async function fetchRecentPurchases() {
  // Devolvemos orders/items, normalizamos created at para books, con su id titulo y portada
  const tryShapes = async (url, params) => {
    const { data } = await api.get(url, { params })
    const raw = Array.isArray(data?.orders)
      ? data.orders
      : Array.isArray(data?.items)
      ? data.items
      : []
    // get a url con params
    //busco la coleccion de pedidos teniendo en cuenta orders y items.

    return raw.map((o) => {
      const lines = Array.isArray(o.orderItems)
        ? o.orderItems
        : Array.isArray(o.items)
        ? o.items
        : []
      // cada pedido puede mostrar tanto como orderItems o .items. lo contamos con "lines"
      const books = lines.map((it) => {
        const b = it.book && typeof it.book === 'object' ? it.book : null
        return {
          _id:
            b?._id || it.bookId || it.book || it._id || String(Math.random()),
          title: b?.title || it.title || 'Libro',
          coverImage: b?.coverImage || it.image || it.coverImage || null
        }
        //tengo en cuenta si la res viene por it.book: _id, title, cover... o si viene por campos sueltos,
        //eligo el primer identificador que coincida y relleno cada campo con el primer valor dispo
        //String(Math.random()), no rompe el renter si no hay id. de normal no llegamos ahi
      })
      return { createdAt: o.createdAt || o.date || null, books }
      // devuelvo cada pedido con createdAt, date y books como array aceptado
    })
  }

  // Intentos (el primero que funcione gana)
  const variants = [
    () => tryShapes('/api/orders/my', { limit: 3, sort: '-createdAt' }),
    () => tryShapes('/api/orders', { mine: 1, limit: 3, sort: '-createdAt' }),
    () => tryShapes('/api/orders', { user: 'me', limit: 3, sort: '-createdAt' })
  ]
  // pruebo entre 3 rutas para evitar que rompa, la primera que funcione gana

  for (const fn of variants) {
    try {
      const arr = await fn()
      // ordenamos desc por fecha, elegimos solo a 3 y flatt a lista de libros recientes
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

    //ordenamos pedidos por fecha desc + 3 recientes
    //de esos pedidos, saco libros hasta tener 3
    // tengo como result array de libros, no pedidos, listos para render
  }
  return [] // si nada  funciona devolvemos vacío
}

// 3 last mensajes recibidos admin a usuario
export async function fetchLastInboxMessages(limit = 3) {
  const { data } = await api.get('/api/users/messages', {
    params: { limit, page: 1 }
  })
  const items = Array.isArray(data?.items) ? data.items : []
  // llamo a enp inbox de usuario con limit y page1, tomo la coleccion en data.items

  return items
    .sort((a, b) => +new Date(b.createdAt || 0) - +new Date(a.createdAt || 0))
    .slice(0, limit)
  //backend devuelve en des, refuerzo desc desde aqui
}
