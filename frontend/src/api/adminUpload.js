import api from './index.js' // tu axios con interceptores

// subidas multi part form data para admin libro cover
export async function uploadBookCover(bookId, file) {
  if (!file) throw new Error('Selecciona un archivo de imagen.')
  const fd = new FormData()
  fd.append('cover', file)
  const { data } = await api.post(`/api/admin/books/${bookId}/cover`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}
// subida multipart form data para foto author admin
export async function uploadAuthorPhoto(authorId, file) {
  if (!file) throw new Error('Selecciona un archivo de imagen.')
  const fd = new FormData()
  fd.append('photo', file) // lo que espera el backend
  const { data } = await api.post(`/api/admin/authors/${authorId}/photo`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

// subida de multipart form data para avatar usuario
export async function uploadUserAvatar(userId, file) {
  const fd = new FormData()
  fd.append('avatar', file)
  const { data } = await api.post(`/api/admin/users/${userId}/avatar`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  // backend deevuelve avatar: /uploads/...
  return data
}
