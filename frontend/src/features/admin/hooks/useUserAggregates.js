// useUserAggregates.js
import { useEffect, useState } from 'react'
import { listOrders, listReviews } from '../api/adminApi'

const sameId = (a, b) => String(a || '').trim() === String(b || '').trim()

export default function useUserAggregates(userId) {
  const [orders, setOrders] = useState([])
  const [ordersTotal, setOrdersTotal] = useState(0)
  const [reviews, setReviews] = useState([])
  const [reviewsTotal, setReviewsTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      try {
        // Pedidos
        try {
          const resOrders = await listOrders({ page: 1, limit: 500, userId })
          const arr = Array.isArray(resOrders?.orders) ? resOrders.orders : []
          const filtered = arr.filter((o) => {
            const uu = o.user
            const uid = typeof uu === 'object' ? uu?._id || uu?.id : uu
            return sameId(uid, userId)
          })
          if (!alive) return
          setOrders(filtered)
          setOrdersTotal(filtered.length)
        } catch {
          if (!alive) return
          setOrders([])
          setOrdersTotal(0)
        }

        // Reseñas
        try {
          const resReviews = await listReviews({
            page: 1,
            limit: 500,
            userId,
            order: 'desc'
          })
          const arr = Array.isArray(resReviews?.reviews)
            ? resReviews.reviews
            : []
          const filtered = arr.filter((r) => {
            const uu = r.user
            const uid = typeof uu === 'object' ? uu?._id || uu?.id : uu
            return sameId(uid, userId)
          })
          if (!alive) return
          setReviews(filtered)
          setReviewsTotal(filtered.length)
        } catch {
          if (!alive) return
          setReviews([])
          setReviewsTotal(0)
        }
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [userId])

  return {
    loading,
    orders,
    ordersTotal,
    setOrders,
    setOrdersTotal,
    reviews,
    reviewsTotal,
    setReviews,
    setReviewsTotal
  }
}
