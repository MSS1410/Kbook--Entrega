import api from './index'

// devuelvo libros comprados por usuario auth
export const getMyBooks = () => api.get('/api/users/profile/books')
