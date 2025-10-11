import { useEffect, useState } from 'react'
import { listOrders, listReviews } from '../api/adminApi'
//listorders y listrevies son funciones de capa admin, llaman a backend
const sameId = (a, b) => String(a || '').trim() === String(b || '').trim()

//sameId, norma y comparacion de ids
export default function useUserAggregates(userId) {
  //estado local, mantengo listas y totales por separado
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
        // pedidos
        // disparo cuando cambvia userId,
        try {
          const resOrders = await listOrders({ page: 1, limit: 500, userId })
          //pido hasta 500 pedidos del usuario
          const arr = Array.isArray(resOrders?.orders) ? resOrders.orders : []
          // userId, se pasa a la API, por si acaso revalido en cliente por si api devuelve mal
          const filtered = arr.filter((o) => {
            // aseguro user
            const uu = o.user
            // extraigo userid usable para comparar con sameID
            const uid = typeof uu === 'object' ? uu?._id || uu?.id : uu
            return sameId(uid, userId)
          })
          // allive es un flag, evita  setState si el componente se desmonta mientras pasa el async
          if (!alive) return
          setOrders(filtered)
          setOrdersTotal(filtered.length)
        } catch {
          if (!alive) return
          setOrders([])
          setOrdersTotal(0)
        }

        // 4eseñas
        try {
          // repito patron de pedidos en reviews
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
            // normalizo usuaeio para compararlo
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
        // hago setLoadingFalse si intenta seguir montando
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
