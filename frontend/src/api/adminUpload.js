// frontend/src/api/adminUpload.js
import api from './index.js' // tu axios con interceptores

export async function uploadBookCover(bookId, file) {
  if (!file) throw new Error('Selecciona un archivo de imagen.')
  const fd = new FormData()
  fd.append('cover', file)
  const { data } = await api.post(`/api/admin/books/${bookId}/cover`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

export async function uploadAuthorPhoto(authorId, file) {
  if (!file) throw new Error('Selecciona un archivo de imagen.')
  const fd = new FormData()
  fd.append('photo', file) // ← campo esperado por el backend
  const { data } = await api.post(`/api/admin/authors/${authorId}/photo`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

// Sube avatar de usuario admin: POST /api/admin/users/:id/avatar  (Multipart)
export async function uploadUserAvatar(userId, file) {
  const fd = new FormData()
  fd.append('avatar', file)
  const { data } = await api.post(`/api/admin/users/${userId}/avatar`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  // backend debería devolver { avatar: '/uploads/...' }
  return data
}
