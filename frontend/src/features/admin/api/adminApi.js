// frontend/src/admin/api/adminApi.js
import api from '../../../api/index'

/* ============== HELPERS GENERALES ============== */

const DEFAULT_ARRAY_KEYS = [
  'items',
  'orders',
  'users',
  'reviews',
  'books',
  'authors'
]

const pickArray = (data, keys = DEFAULT_ARRAY_KEYS) => {
  if (!data) return []
  for (const k of keys) {
    const v = data?.[k]
    if (Array.isArray(v)) return v
  }
  // si el propio data es array:
  if (Array.isArray(data)) return data
  return []
}

const sumBy = (arr, f) => arr.reduce((acc, x) => acc + (f(x) || 0), 0)

const get = (url, params) => api.get(url, { params }).then((r) => r.data)

/* ============== DASHBOARD ============== */
export async function fetchAdminHome() {
  // Tarjetas recientes
  const usersReq = get('/api/admin/users', { order: 'desc', limit: 10 })
    .then((d) => pickArray(d, ['users', ...DEFAULT_ARRAY_KEYS]))
    .catch(() => [])

  const ordersRecentReq = get('/api/admin/orders', { order: 'desc', limit: 10 })
    .then((d) => pickArray(d, ['orders', ...DEFAULT_ARRAY_KEYS]))
    .catch(() => [])

  const reviewsReq = get('/api/admin/reviews', { order: 'desc', limit: 10 })
    .then((d) => pickArray(d, ['reviews', ...DEFAULT_ARRAY_KEYS]))
    .catch(() => [])

  const dashboardReq = get('/api/admin/dashboard').catch(() => ({}))

  // Inbox (solo no leídos)
  const inboxReq = get('/api/admin/inbox', { unread: 1, limit: 20 })
    .then((d) => d || { items: [], unreadCount: 0 })
    .catch(() => ({ items: [], unreadCount: 0 }))

  // Pedidos últimos 30 días (para la gráfica)
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

  // Compatibilidad: 'totals' o 'totales'
  const totals = dashboard?.totals || dashboard?.totales || {}
  const totalUsers = totals?.usuarios ?? 0
  const totalOrders = totals?.pedidos ?? 0
  const totalSales =
    dashboard?.salesAll?.totalAmount ?? sumBy(ordersRecent, (o) => o.totalPrice)

  // Serie 30 días
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
  start.setDate(now.getDate() - 29)

  const byDay = new Map()
  for (const o of orders30) {
    const k = dayKey(o.createdAt)
    byDay.set(k, (byDay.get(k) || 0) + (o.totalPrice || 0))
  }

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
      series,
      totalAmount: totalSales,
      totalOrders,
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
    const data = await get('/api/books', { page, limit: pageSize }).catch(
      async () => await get('/api/books')
    )
    const arr = pickArray(data, ['books', ...DEFAULT_ARRAY_KEYS])
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

export const getBook = (id) => get(`/api/books/${id}`).then((d) => d?.book || d)

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
    const data = await get('/api/authors', { page, limit: pageSize }).catch(
      async () => await get('/api/authors')
    )
    const arr = pickArray(data, ['authors', ...DEFAULT_ARRAY_KEYS])
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
export const listAuthorsPublic = listAuthorsAll

export const getAuthor = (id) =>
  get(`/api/authors/${id}`).then((d) => d?.author || d)

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
// 💡 Normalizado: siempre devolvemos { orders, total, page, limit }
export const listOrders = async (params = {}) => {
  const d = await get('/api/admin/orders', params)
  const orders = Array.isArray(d?.orders)
    ? d.orders
    : Array.isArray(d?.items)
    ? d.items
    : Array.isArray(d)
    ? d
    : []
  const total =
    typeof d?.total === 'number'
      ? d.total
      : typeof d?.count === 'number'
      ? d.count
      : orders.length
  return { orders, total, page: d?.page, limit: d?.limit }
}

export async function fetchOrdersForLastDays(days = 30, pageSize = 200) {
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000
  let page = 1
  let out = []
  const MAX_PAGES = 10
  while (page <= MAX_PAGES) {
    const res = await listOrders({ page, limit: pageSize })
    const batch = pickArray(res, ['orders', ...DEFAULT_ARRAY_KEYS])
    if (!batch.length) break
    out = out.concat(batch)
    const oldest = batch[batch.length - 1]
    if (oldest && new Date(oldest.createdAt).getTime() < threshold) break
    page += 1
  }
  return out.filter((o) => new Date(o.createdAt).getTime() >= threshold)
}

/* ============== RESEÑAS (admin) ============== */
// 💡 Normalizado: siempre devolvemos { reviews, total, page, limit }
//    y aceptamos bookId/book y userId/user como filtros (compat)
export const listReviews = async (params = {}) => {
  const q = {
    ...params,
    bookId: params.bookId ?? params.book,
    userId: params.userId ?? params.user
  }
  const d = await get('/api/admin/reviews', q)
  const reviews = Array.isArray(d?.reviews)
    ? d.reviews
    : Array.isArray(d?.items)
    ? d.items
    : Array.isArray(d)
    ? d
    : []
  const total =
    typeof d?.total === 'number'
      ? d.total
      : typeof d?.count === 'number'
      ? d.count
      : reviews.length
  return { reviews, total, page: d?.page, limit: d?.limit }
}

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
    const batch = pickArray(res, ['reviews', ...DEFAULT_ARRAY_KEYS])
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
    const data = await get('/api/admin/users', {
      page,
      limit: pageSize,
      sort: '-createdAt'
    })
    const arr = pickArray(data, ['users', ...DEFAULT_ARRAY_KEYS])
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

export const listUsersAdmin = (params = {}) => get('/api/admin/users', params)

export const toggleUserBlockAdmin = (id, value) =>
  api.patch(`/api/admin/users/${id}/block`, { value }).then((r) => r.data)

export const updateUserRoleAdmin = (id, role) =>
  api.patch(`/api/admin/users/${id}/role`, { role }).then((r) => r.data)

export const updateUserAdmin = (id, payload) =>
  api.put(`/api/admin/users/${id}`, payload).then((r) => r.data)

export const deleteUserAdmin = (id) =>
  api.delete(`/api/admin/users/${id}`).then((r) => r.data)

/* ============== MENSAJERÍA (admin) ============== */
export const listAdminInbox = (params = {}) => get('/api/admin/inbox', params)

export const adminSendMessageToUser = (userId, { subject, body }) =>
  api
    .post(`/api/admin/users/${userId}/messages`, { subject, body })
    .then((r) => r.data)

export const adminListMessagesToUser = (userId, params = {}) =>
  get(`/api/admin/users/${userId}/messages`, params)

export const getAdminThreadWithUser = async (userId) => {
  try {
    const d = await get(`/api/admin/users/${userId}/thread`)
    return d
  } catch (err) {
    if (err?.response?.status === 404) {
      const d = await get(`/api/messages/threads/${userId}`)
      return d // { messages: [...] }
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
      if (err?.response?.status === 404) return null
      throw err
    })

export const deleteAdminMessage = (messageId) =>
  api.delete(`/api/admin/messages/${messageId}`).then((r) => r.data)

export const deleteAdminThread = (userId) =>
  api.delete(`/api/admin/users/${userId}/thread`).then((r) => r.data)
