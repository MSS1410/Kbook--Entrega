// ReviewsPage.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import api from '../../../../../api/index.js'
import { AVATAR_PLACEHOLDER } from '../../../../../constants/media.js'

// Presentacionales
import ReviewsSearchBox from './reviewsComponents/ReviewsSearchBox'
import ReviewCard from './reviewsComponents/ReviewCard'
import ReviewsPager from './reviewsComponents/ReviewsPager'

/* ===== Estilos ===== */
const Page = styled.div`
  max-width: 1100px;
  margin: 2rem auto;
  padding: 0 16px;
  display: grid;
  gap: 16px;
  overflow-x: hidden;
`
const Header = styled.header`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 12px;
  align-items: end;
  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`
const Title = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xl};
`
const Subtle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.mutedText};
`

/* Grid de tarjetas */
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
`

// helper para URL absoluta
const getUrl = (u) => {
  if (!u) return ''
  if (/^https?:\/\//i.test(u) || u.startsWith('data:')) return u
  const base = (api.defaults.baseURL || '').replace(/\/+$/, '')
  return `${base}${u.startsWith('/') ? '' : '/'}${u}`
}

export default function ReviewsPage() {
  const loc = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(loc.search)
  const bookIdFromUrl = params.get('book') || ''
  const pageFromUrl = Math.max(1, parseInt(params.get('page') || '1', 10))

  const [page, setPage] = useState(pageFromUrl)
  const [limit] = useState(40)
  const [total, setTotal] = useState(0)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // buscador
  const [q, setQ] = useState('')
  const [qDebounced, setQDebounced] = useState('')
  const [results, setResults] = useState([])
  const [selectedBook, setSelectedBook] = useState(
    bookIdFromUrl ? { _id: bookIdFromUrl } : null
  )
  const resultsRef = useRef(null)

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit]
  )

  // debounce query
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim()), 300)
    return () => clearTimeout(t)
  }, [q])

  // buscar libros por título
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!qDebounced) {
        setResults([])
        return
      }
      try {
        const { data } = await api.get('/api/search', {
          params: { q: qDebounced, limit: 8 }
        })
        const arr = Array.isArray(data?.books) ? data.books : []
        if (!cancelled) setResults(arr)
      } catch {
        if (!cancelled) setResults([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [qDebounced])

  // cargar reseñas (global o por libro)
  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        setError(null)

        if (selectedBook?._id) {
          const { data } = await api.get(
            `/api/reviews/book/${selectedBook._id}`,
            { params: { page, limit, sort: '-createdAt' } }
          )
          const arr = Array.isArray(data)
            ? data
            : data?.items || data?.reviews || []
          setItems(arr)
          setTotal(
            Array.isArray(data) ? arr.length : data?.total || data?.count || 0
          )
        } else {
          const { data } = await api.get('/api/reviews', {
            params: { page, limit, sort: '-createdAt' }
          })
          const arr = Array.isArray(data)
            ? data
            : data?.items || data?.reviews || []
          setItems(arr)
          setTotal(
            Array.isArray(data) ? arr.length : data?.total || data?.count || 0
          )
        }
      } catch (e) {
        setError('No se pudieron cargar las reseñas.')
        setItems([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    })()
  }, [selectedBook?._id, page, limit])

  // sync params en URL
  useEffect(() => {
    const p = new URLSearchParams()
    if (selectedBook?._id) p.set('book', selectedBook._id)
    p.set('page', String(page))
    navigate({ search: p.toString() }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBook?._id, page])

  // cerrar dropdown al click fuera (la ref vive aquí)
  useEffect(() => {
    const onDocClick = (e) => {
      if (!resultsRef.current) return
      if (!resultsRef.current.contains(e.target)) setResults([])
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const handlePick = (b) => {
    setSelectedBook(b)
    setQ(b.title || '')
    setPage(1)
    setResults([])
  }
  const handleClear = () => {
    setSelectedBook(null)
    setQ('')
    setResults([])
    setPage(1)
  }

  return (
    <Page>
      <Header>
        <div>
          <Title>
            {selectedBook?._id ? 'Reseñas del libro' : 'Todas las reseñas'}
          </Title>
        </div>

        <ReviewsSearchBox
          containerRef={resultsRef}
          q={q}
          onChangeQ={setQ}
          results={results}
          onClear={handleClear}
          onPick={handlePick}
        />
      </Header>

      <Subtle>
        Página {page}
        {total ? ` · ${total} reseñas en total` : ''}
      </Subtle>

      {selectedBook?._id && (
        <div>
          <Link to={`/books/${selectedBook._id}`} style={{ color: '#8b5cf6' }}>
            Ver ficha de “{q || 'libro'}”
          </Link>
        </div>
      )}

      {loading && <div>Cargando…</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}

      {!loading && !error && (
        <>
          <Grid>
            {items.map((r) => (
              <ReviewCard
                key={r._id}
                r={r}
                getUrl={getUrl}
                placeholder={AVATAR_PLACEHOLDER}
              />
            ))}
          </Grid>

          {totalPages > 1 && (
            <ReviewsPager
              page={page}
              totalPages={totalPages}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
              onGoto={(n) => setPage(n)}
            />
          )}
        </>
      )}
    </Page>
  )
}
