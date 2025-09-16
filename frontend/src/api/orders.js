import api from './index'

export const createOrder = (payload) => api.post('/api/orders', payload)
export const payOrder = (orderId) => api.patch(`/api/orders/${orderId}/pay`)
