// frontend/src/hooks/useCart.jsx
import { useState, useEffect } from 'react'
import api from '../api/index'
import useAuth from './useAuth'

export default function useCart() {
  const { token } = useAuth()
  const [cart, setCart] = useState({ items: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const openDrawer = () => window.dispatchEvent(new Event('cart:open'))

  const fetchCart = async () => {
    if (!token) {
      setCart({ items: [] })
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const res = await api.get('/api/cart')
      setCart(res.data)
    } catch (err) {
      console.error('Error cargando carrito:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
    // eslint-disable-next-line
  }, [token])

  const addOrUpdate = async ({ bookId, format, quantity = 1 }) => {
    try {
      const res = await api.post('/api/cart', {
        bookId,
        format,
        quantity
      })
      setCart(res.data)
      return res.data
    } catch (err) {
      console.error('Error añadiendo/updating al carrito', err)
      setError(err)
      throw err
    }
  }

  const removeItem = async ({ bookId, format }) => {
    try {
      const res = await api.delete('/api/cart', {
        data: { bookId, format }
      })
      setCart(res.data)
      return res.data
    } catch (err) {
      console.error('Error eliminando del carrito', err)
      setError(err)
      throw err
    }
  }

  const clear = async () => {
    try {
      const res = await api.post('/api/cart/clear')
      setCart(res.data)
      return res.data
    } catch (err) {
      console.error('Error limpiando carrito', err)
      setError(err)
      throw err
    }
  }

  return {
    cart,
    loading,
    error,
    addOrUpdate,
    removeItem,
    clear,
    refresh: fetchCart,
    openDrawer
  }
}
