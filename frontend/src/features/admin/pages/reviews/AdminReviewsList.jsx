import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useSearchParams } from 'react-router-dom'
import { listReviews, deleteReview } from '../../api/adminApi.js'
import ReviewsListToolbar from '../../components/reviews/reviewsList/ReviewsListToolbar.jsx'
import ReviewsGrid from '../../components/reviews/reviewsList/ReviewsGrid.jsx'
import ReviewsPager from '../../components/reviews/reviewsList/ReviewsPager.jsx'

const Wrap = styled.div`
  display: grid;
  gap: 16px;
`
const PER_PAGE = 40 // tamaño de pagina

export default function AdminReviewsList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(Number(searchParams.get('page') || 1)) // estado controlado por URL
  const [order, setOrder] = useState(
    (searchParams.get('order') || 'desc').toLowerCase() //  asc//desc
  )

  const [reviews, setReviews] = useState([]) // reseñas pg act
  const [total, setTotal] = useState(0) //  total reviews para pager
  const [loading, setLoading] = useState(true)
  const [deletingIds, setDeletingIds] = useState(() => new Set())

  useEffect(() => {
    // sincro estado con query
    const sp = new URLSearchParams()
    sp.set('page', String(page))
    sp.set('order', order)
    setSearchParams(sp)
  }, [page, order, setSearchParams])

  const totalPages = useMemo(
    //pag totales?
    () => Math.max(1, Math.ceil(total / PER_PAGE)),
    [total]
  )

  useEffect(() => {
    ;(async () => {
      // fetch paged listado
      setLoading(true)
      try {
        const res = await listReviews({ page, limit: PER_PAGE, order })
        const arr = Array.isArray(res?.reviews)
          ? res.reviews
          : Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res)
          ? res
          : []
        setReviews(arr)
        setTotal(
          typeof res?.total === 'number'
            ? res.total
            : typeof res?.count === 'number'
            ? res.count
            : arr.length
        )
      } finally {
        setLoading(false)
      }
    })()
  }, [page, order])

  const onDelete = async (r) => {
    // handler eliminar reseña
    const bookTitle =
      (typeof r.book === 'object' ? r.book?.title : '') || 'este libro'
    const userName =
      (typeof r.user === 'object' ? r.user?.name : '') || 'este usuario'
    if (
      !confirm(
        `¿Eliminar la reseña de ${userName} sobre "${bookTitle}" de forma permanente?`
      )
    )
      return

    setDeletingIds((s) => new Set(s).add(r._id)) // ← marca "eliminado"
    try {
      await deleteReview(r._id)
      setReviews((list) => list.filter((x) => x._id !== r._id)) // quita en local
      setTotal((t) => Math.max(0, t - 1))
      setTimeout(() => {
        // empty page -> back
        setReviews((list) => {
          if (list.length === 0 && page > 1) setPage(page - 1)
          return list
        })
      }, 0)
    } catch (e) {
      console.error('No se pudo eliminar la reseña', e)
      alert('No se pudo eliminar la reseña. Inténtalo de nuevo.')
    } finally {
      setDeletingIds((s) => {
        const next = new Set(s)
        next.delete(r._id)
        return next
      })
    }
  }

  return (
    <Wrap>
      <ReviewsListToolbar
        order={order}
        total={total}
        onChangeOrder={(v) => {
          setOrder(v)
          setPage(1)
        }} // al cambiar orden, vuelvo pag 1
      />

      {loading ? (
        <div style={{ padding: 12 }}>Cargando…</div>
      ) : reviews.length === 0 ? (
        <div style={{ padding: 12, color: '#64748b' }}>No hay reseñas.</div>
      ) : (
        <>
          <ReviewsGrid
            reviews={reviews}
            deletingIds={deletingIds}
            onDelete={onDelete}
          />
          <ReviewsPager
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </>
      )}
    </Wrap>
  )
}
