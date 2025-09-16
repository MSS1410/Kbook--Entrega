// frontend/src/api/reviews.js
import api from './index'

export const createOrUpdateReview = ({ bookId, rating, comment, avatar }) =>
  api.post('/api/reviews', { book: bookId, rating, comment, avatar })

export const getReviewsByBook = (bookId) =>
  api.get(`/api/reviews/book/${bookId}`)

export const getAllReviews = (params = {}) =>
  api.get('/api/reviews', { params })

export const updateReview = (id, payload) =>
  api.put(`/api/reviews/${id}`, payload)

export const deleteReview = (id) => api.delete(`/api/reviews/${id}`)
