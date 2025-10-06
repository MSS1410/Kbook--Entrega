import api from '../api/index'

// Inbox “simple” (admin → usuario) ya existente
export const getMyMessages = async ({ limit = 50, page = 1, unread } = {}) => {
  const params = { limit, page }
  if (typeof unread !== 'undefined') params.unread = unread ? 1 : 0
  return api.get('/api/users/messages', { params })
}

export const markMessageRead = async (id, read = true) => {
  return api.patch(`/api/users/messages/${id}/read`, { read })
}

// Threads P2P (nuevo)
export const getThreads = () => api.get('/api/messages/threads')

export const getThreadMessages = (participantId) =>
  api.get(`/api/messages/threads/${participantId}`)

export const sendMessageToThread = (participantId, body, subject = '') =>
  api.post(`/api/messages/threads/${participantId}/messages`, { body, subject })

export const startThread = (participantId, firstMessage = '', subject = '') =>
  api.post('/api/messages/threads', { participantId, firstMessage, subject })

export const searchUsers = (q) =>
  api.get('/api/messages/users/search', { params: { q } })
