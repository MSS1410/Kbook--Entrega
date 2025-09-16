// frontend/src/api/users.js
import api from './index'

// Libros comprados por el usuario autenticado
export const getMyBooks = () => api.get('/api/users/profile/books')
