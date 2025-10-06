// frontend/src/admin/api/adminApi.js
import api from '../../../api/index'

/* ============== HELPERS ============== */
const pickArray = (data, keys) => {
  for (const k of keys) if (Array.isArray(data?.[k])) return data[k]
  if (Array.isArray(data)) return data
  return []
}

/* ============== DASHBOARD ============== */
export async function fetchAdminHome() {
  // Para tarjetas recientes
  const usersReq = api
    .get('/api/admin/users', { params: { sort: '-createdAt', limit: 10 } })
    .then((r) => r.data?.users || r.data || [])
    .catch(() => [])

  const ordersRecentReq = api
    .get('/api/admin/orders', { params: { sort: '-createdAt', limit: 10 } })
    .then((r) => r.data?.orders || r.data || [])
    .catch(() => [])

  const reviewsReq = api
    .get('/api/admin/reviews', { params: { sort: '-createdAt', limit: 10 } })
    .then((r) => r.data?.reviews || r.data || [])
    .catch(() => [])

  const dashboardReq = api
    .get('/api/admin/dashboard')
    .then((r) => r.data)
    .catch(() => ({}))

  // ⬇️ inbox solo NO LEÍDOS
  const inboxReq = api
    .get('/api/admin/inbox', { params: { unread: 1, limit: 20 } })
    .then((r) => r.data || { items: [], unreadCount: 0 })
    .catch(() => ({ items: [], unreadCount: 0 }))

  // ⬇️ pedidos de los últimos 30 días (para la gráfica)
  const orders30Req = fetchOrdersForLastDays(30, 500).catch(() => [])

  const [dashboard, users, ordersRecent, reviews, inbox, orders30] =
    await Promise.all([
      dashboardReq,
      usersReq,
      ordersRecentReq,
      reviewsReq,
      inboxReq,
      orders30Req
    ])

  // Totales robustos (vienen del dashboard)
  const totalUsers = dashboard?.totales?.usuarios ?? 0
  const totalOrders = dashboard?.totales?.pedidos ?? 0
  const totalSales =
    dashboard?.salesAll?.totalAmount ??
    ordersRecent.reduce((acc, o) => acc + (o.totalPrice || 0), 0)

  // Serie 30d: YYYY-MM-DD -> amount
  const dayKey = (d) => {
    const x = new Date(d)
    x.setHours(0, 0, 0, 0)
    const y = x.getFullYear()
    const m = String(x.getMonth() + 1).padStart(2, '0')
    const dd = String(x.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
  }
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const start = new Date(now)
  start.setDate(now.getDate() - 29) // 30 días incluyendo hoy

  // Suma importes por día
  const byDay = new Map()
  for (const o of orders30) {
    const k = dayKey(o.createdAt)
    byDay.set(k, (byDay.get(k) || 0) + (o.totalPrice || 0))
  }

  // Relleno de días vacíos para que la gráfica sea continua
  const series = []
  for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
    const k = dayKey(d)
    series.push({ date: k, amount: byDay.get(k) || 0 })
  }

  return {
    users,
    orders: ordersRecent,
    reviews,
    inbox: inbox.items || [],
    unreadCount: inbox.unreadCount || 0,
    metrics: {
      series, // ← gráfica 30 días
      totalAmount: totalSales, // ventas totales
      totalOrders: totalOrders,
      usersTotal: totalUsers
    }
  }
}

/* ============== LIBROS ============== */
export const listBooksAll = async () => {
  const pageSize = 100
  let page = 1,
    out = []
  while (true) {
    const { data } = await api
      .get('/api/books', { params: { page, limit: pageSize } })
      .catch(async () => ({ data: (await api.get('/api/books')).data }))
    const arr = pickArray(data, ['books', 'items'])
    out = out.concat(arr)
    const total = data?.total || data?.count
    const pages =
      data?.pages || (total ? Math.ceil(total / pageSize) : undefined)
    if (!pages) {
      if (arr.length < pageSize) break
      page++
    } else {
      if (page >= pages) break
      page++
    }
    if (page > 50) break
  }
  return out
}

export const getBook = (id) =>
  api.get(`/api/books/${id}`).then((r) => r.data?.book || r.data)

export const createBook = (payload) =>
  api.post('/api/admin/books', payload).then((r) => r.data)

export const updateBook = (id, payload) =>
  api.put(`/api/admin/books/${id}`, payload).then((r) => r.data)

export const deleteBook = (id) =>
  api.delete(`/api/admin/books/${id}`).then((r) => r.data)

export const updateBookCover = (id, url) =>
  api
    .patch(`/api/admin/books/${id}/cover`, { coverImage: url })
    .then((r) => r.data)

export const toggleBookFeatured = (id, value) =>
  api.patch(`/api/admin/books/${id}/featured`, { value }).then((r) => r.data)

/* ============== AUTORES ============== */
export const listAuthorsAll = async () => {
  const pageSize = 100
  let page = 1,
    out = []
  while (true) {
    const { data } = await api
      .get('/api/authors', { params: { page, limit: pageSize } })
      .catch(async () => ({ data: (await api.get('/api/authors')).data }))
    const arr = pickArray(data, ['authors', 'items'])
    out = out.concat(arr)
    const total = data?.total || data?.count
    const pages =
      data?.pages || (total ? Math.ceil(total / pageSize) : undefined)
    if (!pages) {
      if (arr.length < pageSize) break
      page++
    } else {
      if (page >= pages) break
      page++
    }
    if (page > 50) break
  }
  return out
}
export const listAuthorsPublic = listAuthorsAll // alias
export const getAuthor = (id) =>
  api.get(`/api/authors/${id}`).then((r) => r.data?.author || r.data)

export const createAuthor = (payload) =>
  api.post('/api/admin/authors', payload).then((r) => r.data)

export const updateAuthor = (id, payload) =>
  api.put(`/api/admin/authors/${id}`, payload).then((r) => r.data)

export const deleteAuthor = (id) =>
  api.delete(`/api/admin/authors/${id}`).then((r) => r.data)

export const updateAuthorPhoto = (id, url) =>
  api
    .patch(`/api/admin/authors/${id}/photo`, { photo: url })
    .then((r) => r.data)

export const toggleAuthorFeatured = (id, value) =>
  api.patch(`/api/admin/authors/${id}/featured`, { value }).then((r) => r.data)

/* ============== PEDIDOS (admin) ============== */
export const listOrders = (params = {}) =>
  api.get('/api/admin/orders', { params }).then((r) => r.data)

export async function fetchOrdersForLastDays(days = 30, pageSize = 200) {
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000
  let page = 1
  let out = []
  const MAX_PAGES = 10
  while (page <= MAX_PAGES) {
    const res = await listOrders({ page, limit: pageSize })
    const batch = Array.isArray(res?.orders)
      ? res.orders
      : Array.isArray(res)
      ? res
      : []
    if (!batch.length) break
    out = out.concat(batch)
    const oldest = batch[batch.length - 1]
    if (new Date(oldest.createdAt).getTime() < threshold) break
    page += 1
  }
  return out.filter((o) => new Date(o.createdAt).getTime() >= threshold)
}

/* ============== RESEÑAS (admin) ============== */
export const listReviews = (params = {}) =>
  api.get('/api/admin/reviews', { params }).then((r) => r.data)

export const deleteReview = (id) =>
  api.delete(`/api/admin/reviews/${id}`).then((r) => r.data)

export const editReview = (id, payload) =>
  api.patch(`/api/admin/reviews/${id}`, payload).then((r) => r.data)

export async function computeReviewStats(maxPages = 10, pageSize = 200) {
  let page = 1
  const userCount = new Map()
  const userInfo = new Map()
  const bookCount = new Map()
  const bookInfo = new Map()

  while (page <= maxPages) {
    const res = await listReviews({ page, limit: pageSize })
    const batch = Array.isArray(res?.reviews) ? res.reviews : []
    if (!batch.length) break

    for (const r of batch) {
      const u = r.user && typeof r.user === 'object' ? r.user : null
      const b = r.book && typeof r.book === 'object' ? r.book : null

      if (u && u._id) {
        const k = String(u._id)
        userCount.set(k, (userCount.get(k) || 0) + 1)
        if (!userInfo.has(k))
          userInfo.set(k, {
            id: k,
            name: u.name || 'Usuario',
            avatar: u.avatar || ''
          })
      }
      if (b && b._id) {
        const k2 = String(b._id)
        bookCount.set(k2, (bookCount.get(k2) || 0) + 1)
        if (!bookInfo.has(k2))
          bookInfo.set(k2, {
            id: k2,
            title: b.title || 'Libro',
            coverImage: b.coverImage || ''
          })
      }
    }

    const total = res?.total
    const pages = total
      ? Math.ceil(total / pageSize)
      : batch.length < pageSize
      ? page
      : undefined
    if (!pages) {
      if (batch.length < pageSize) break
      page++
    } else {
      if (page >= pages) break
      page++
    }
  }

  const topUsers = Array.from(userCount.entries())
    .map(([id, count]) => ({ ...userInfo.get(id), count }))
    .sort((a, b) => b.count - a.count)

  const topBooks = Array.from(bookCount.entries())
    .map(([id, count]) => ({ ...bookInfo.get(id), count }))
    .sort((a, b) => b.count - a.count)

  return { topUsers, topBooks }
}

/* ============== USERS (admin) ============== */
export const listAllUsersAdmin = async () => {
  const pageSize = 100
  let page = 1,
    out = []
  while (true) {
    const { data } = await api.get('/api/admin/users', {
      params: { page, limit: pageSize, sort: '-createdAt' }
    })
    const arr = data?.users || []
    out = out.concat(arr)
    const total = data?.total
    const pages = total
      ? Math.ceil(total / pageSize)
      : arr.length < pageSize
      ? page
      : undefined
    if (!pages) {
      if (arr.length < pageSize) break
      page++
    } else {
      if (page >= pages) break
      page++
    }
    if (page > 100) break
  }
  return out
}

export const listUsersAdmin = (params = {}) =>
  api.get('/api/admin/users', { params }).then((r) => r.data)

export const toggleUserBlockAdmin = (id, value) =>
  api.patch(`/api/admin/users/${id}/block`, { value }).then((r) => r.data)

export const updateUserRoleAdmin = (id, role) =>
  api.patch(`/api/admin/users/${id}/role`, { role }).then((r) => r.data)

export const updateUserAdmin = (id, payload) =>
  api.put(`/api/admin/users/${id}`, payload).then((r) => r.data)

export const deleteUserAdmin = (id) =>
  api.delete(`/api/admin/users/${id}`).then((r) => r.data)

/* ============== MENSAJERÍA (admin) ============== */
// Inbox paginado (solo recibidos)
export const listAdminInbox = (params = {}) =>
  api.get('/api/admin/inbox', { params }).then((r) => r.data)

// Enviar mensaje a un usuario
export const adminSendMessageToUser = (userId, { subject, body }) =>
  api
    .post(`/api/admin/users/${userId}/messages`, { subject, body })
    .then((r) => r.data)

export const adminListMessagesToUser = (userId, params = {}) =>
  api.get(`/api/admin/users/${userId}/messages`, { params }).then((r) => r.data)

// === Nuevos helpers de hilo & estado ===
export const getAdminThreadWithUser = async (userId) => {
  try {
    const r = await api.get(`/api/admin/users/${userId}/thread`)
    return r.data
  } catch (err) {
    if (err?.response?.status === 404) {
      // ↩️ Fallback: usar threads P2P ya montado
      const { data } = await api.get(`/api/messages/threads/${userId}`)
      return data // { messages: [...] } con el mismo shape que espera la UI
    }
    throw err
  }
}

export const markAdminMessageRead = (messageId, read = true) =>
  api
    .patch(`/api/admin/messages/${messageId}/read`, { read })
    .then((r) => r.data)

export const markAllFromUserRead = (userId) =>
  api
    .patch(`/api/admin/users/${userId}/messages/read`)
    .then((r) => r.data)
    .catch((err) => {
      // Si ese endpoint aún no está montado o no llegó a recargarse el server,
      // NO bloquees la UI.
      if (err?.response?.status === 404) return null
      throw err
    })

export const deleteAdminMessage = (messageId) =>
  api.delete(`/api/admin/messages/${messageId}`).then((r) => r.data)

export const deleteAdminThread = (userId) =>
  api.delete(`/api/admin/users/${userId}/thread`).then((r) => r.data)
