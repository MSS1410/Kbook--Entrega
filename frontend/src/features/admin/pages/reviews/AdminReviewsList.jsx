import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Link, useSearchParams } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import { listReviews, deleteReview } from '../../api/adminApi.js'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'

const Wrap = styled.div`
  display: grid;
  gap: 16px;
`

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  h2 {
    font-size: 20px;
    margin: 0;
  }
  small {
    color: ${({ theme }) => theme.colors.mutedText};
  }
`

const Controls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
  border-radius: 10px;
`

/* ===== Grid responsivo sin overflow lateral ===== */
const Grid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  align-items: stretch;
  min-width: 0;
`

const Card = styled.article`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  padding: 14px;
  display: grid;
  gap: 12px;
  min-width: 0; /* evita overflow en hijos */
`

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  min-width: 0;
`

const UserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  object-fit: cover;
  background: #eee;
  flex: 0 0 auto;
`

const UserName = styled.div`
  font-weight: 600;
  line-height: 1.15;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Meta = styled.div`
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 12px;
`

const Rating = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  flex: 0 0 auto;
`

const BookRow = styled.div`
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 10px;
  align-items: center;
  min-width: 0;
`

const Cover = styled.img`
  width: 44px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  background: #f1f1f1;
  flex: 0 0 auto;
`

const Title = styled.div`
  font-weight: 700;
  line-height: 1.2;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Text = styled.p`
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: ${({ theme }) => theme.colors.onSurface};
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: space-between;
`

const LeftActions = styled.div`
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
`

const RightActions = styled.div`
  display: inline-flex;
  gap: 8px;
`

const Pager = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
`

const PER_PAGE = 40

export default function AdminReviewsList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(Number(searchParams.get('page') || 1))
  const [order, setOrder] = useState(
    (searchParams.get('order') || 'desc').toLowerCase()
  ) // 'desc' | 'asc'

  const [reviews, setReviews] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [deletingIds, setDeletingIds] = useState(() => new Set())

  // Sincroniza URL
  useEffect(() => {
    const sp = new URLSearchParams()
    sp.set('page', String(page))
    sp.set('order', order)
    setSearchParams(sp)
  }, [page, order, setSearchParams])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PER_PAGE)),
    [total]
  )

  // Fetch
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        // Backend debe soportar ?page, ?limit, ?order (desc|asc)
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

    // deshabilita sólo el botón de esta reseña
    setDeletingIds((s) => new Set(s).add(r._id))
    try {
      await deleteReview(r._id)

      // Optimista: saca del estado y ajusta contadores
      setReviews((list) => list.filter((x) => x._id !== r._id))
      setTotal((t) => Math.max(0, t - 1))

      // Si la página se quedó sin items y hay páginas anteriores, retrocede
      setTimeout(() => {
        setReviews((list) => {
          if (list.length === 0 && page > 1) {
            setPage(page - 1)
          }
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
      <Head>
        <div>
          <h2>Todas las reseñas</h2>
          <small>
            {order === 'desc'
              ? 'Más recientes primero'
              : 'Más antiguas primero'}{' '}
            · {total} en total
          </small>
        </div>

        <Controls>
          <Select
            value={order}
            onChange={(e) => {
              setOrder(e.target.value)
              setPage(1)
            }}
            aria-label='Ordenar por fecha'
            title='Ordenar por fecha'
          >
            <option value='desc'>Más recientes</option>
            <option value='asc'>Más antiguas</option>
          </Select>
        </Controls>
      </Head>

      {loading ? (
        <div style={{ padding: 12 }}>Cargando…</div>
      ) : reviews.length === 0 ? (
        <div style={{ padding: 12, color: '#64748b' }}>No hay reseñas.</div>
      ) : (
        <>
          <Grid>
            {reviews.map((r) => {
              const user = r.user && typeof r.user === 'object' ? r.user : null
              const book = r.book && typeof r.book === 'object' ? r.book : null
              const userId = user?._id || user?.id
              const bookId = book?._id || book?.id
              const userName = user?.name || 'Usuario'
              const avatar = user?.avatar || ''
              const dateStr = r.createdAt
                ? new Date(r.createdAt).toLocaleString()
                : '—'
              const rating = typeof r.rating === 'number' ? r.rating : '—'
              const cover = book?.coverImage || ''
              const bookTitle = book?.title || 'Libro'

              const deleting = deletingIds.has(r._id)

              return (
                <Card key={r._id}>
                  <TopRow>
                    <UserRow>
                      {avatar ? (
                        <Avatar src={avatar} alt={userName} />
                      ) : (
                        <Avatar as='div' />
                      )}
                      <div style={{ minWidth: 0 }}>
                        <UserName title={userName}>{userName}</UserName>
                        <Meta>{dateStr}</Meta>
                      </div>
                    </UserRow>
                    <Rating>★ {rating}</Rating>
                  </TopRow>

                  <BookRow>
                    {cover ? (
                      <Cover src={cover} alt={bookTitle} />
                    ) : (
                      <Cover as='div' />
                    )}
                    <Title title={bookTitle}>{bookTitle}</Title>
                  </BookRow>

                  {r.comment ? <Text>{r.comment}</Text> : null}

                  <Actions>
                    <LeftActions>
                      {userId && (
                        <Button
                          as={Link}
                          to={`/admin/users/${userId}`}
                          $variant='ghost'
                        >
                          Ver usuario
                        </Button>
                      )}
                      {bookId && (
                        <Button
                          as={Link}
                          to={`/admin/books/${bookId}`}
                          $variant='ghost'
                        >
                          Ver libro
                        </Button>
                      )}
                    </LeftActions>

                    <RightActions>
                      <Button
                        $variant='danger'
                        onClick={() => onDelete(r)}
                        disabled={deleting}
                        title='Eliminar reseña'
                      >
                        <Trash2 size={16} />
                        {deleting ? ' Eliminando…' : ' Eliminar'}
                      </Button>
                    </RightActions>
                  </Actions>
                </Card>
              )
            })}
          </Grid>

          <Pager>
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft size={16} /> Anterior
            </Button>
            <div>
              {' '}
              Página {page} de {totalPages}{' '}
            </div>
            <Button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Siguiente <ChevronRight size={16} />
            </Button>
          </Pager>
        </>
      )}
    </Wrap>
  )
}
