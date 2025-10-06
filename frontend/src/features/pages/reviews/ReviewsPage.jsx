import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import api from '../../../api'
import { AVATAR_PLACEHOLDER } from '../../../constants/media'

/* ===== Estilos ===== */
const Page = styled.div`
  max-width: 1100px;
  margin: 2rem auto;
  padding: 0 16px;
  display: grid;
  gap: 16px;
  overflow-x: hidden; /* ✅ evita scroll lateral accidental */
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

/* Search */
const SearchWrap = styled.div`
  position: relative;
  display: grid;
  gap: 6px;
`
const SearchRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px;
`
const SearchInput = styled.input`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
`
const ClearBtn = styled.button`
  padding: 8px 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.mutedText};
  cursor: pointer;
`
const Results = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin: 6px 0 0;
  max-height: 280px;
  overflow: auto;
  z-index: 5;
`
const ResultItem = styled.li`
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 8px;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.mutedSurface};
  }
  img {
    width: 32px;
    height: 48px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
  .t {
    font-weight: 600;
  }
  .a {
    color: ${({ theme }) => theme.colors.mutedText};
    font-size: 0.9rem;
  }
`

/* Grid de tarjetas */
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
`
const Card = styled.article`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.cardBg};
  padding: 14px;
  display: grid;
  gap: 10px;
  min-width: 0;
`
const Row = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 10px;
  align-items: center;
`
const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  object-fit: cover;
  background: #f1f1f6;
`
const UserName = styled.div`
  font-weight: 700;
`
const BookRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
  img {
    width: 36px;
    height: 54px;
    border-radius: 6px;
    object-fit: cover;
    border: 1px solid ${({ theme }) => theme.colors.border};
    flex: 0 0 auto;
  }
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-weight: 600;
    min-width: 0;
  }
`
const Stars = styled.div`
  color: #f59e0b;
  letter-spacing: 1px;
  font-size: 16px;
`
const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 12px;
`

/* Pager */
const Pager = styled.div`
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: center;
  margin-top: 4px;
  flex-wrap: wrap;
`
const PageBtn = styled.button`
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : '#fff'};
  color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.onSurface)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
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
  const [limit] = useState(40) // ✅ 40 por página
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
            {
              params: { page, limit, sort: '-createdAt' }
            }
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

  // UX: cerrar dropdown al click fuera
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

        <SearchWrap ref={resultsRef}>
          <SearchRow>
            <SearchInput
              type='search'
              placeholder='Buscar por título de libro…'
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                if (!selectedBook) setResults([])
              }}
              aria-label='Buscar libro por título'
            />
            <ClearBtn onClick={handleClear} disabled={!q && !selectedBook}>
              Limpiar
            </ClearBtn>
          </SearchRow>

          {!!results.length && (
            <Results>
              {results.map((b) => (
                <ResultItem key={b._id} onClick={() => handlePick(b)}>
                  <img
                    src={
                      b.coverImage ||
                      'https://via.placeholder.com/64x96?text=Libro'
                    }
                    alt={b.title}
                    loading='lazy'
                  />
                  <div>
                    <div className='t'>{b.title}</div>
                    <div className='a'>{b.author?.name || ''}</div>
                  </div>
                </ResultItem>
              ))}
            </Results>
          )}
        </SearchWrap>
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
              <Card key={r._id}>
                <Row>
                  <Avatar
                    src={getUrl(r.user?.avatar) || AVATAR_PLACEHOLDER}
                    alt={r.user?.name || 'Usuario'}
                    onError={(e) => {
                      if (e.currentTarget.src !== AVATAR_PLACEHOLDER) {
                        e.currentTarget.src = AVATAR_PLACEHOLDER
                      }
                    }}
                  />
                  <div>
                    <UserName>{r.user?.name || 'Usuario'}</UserName>
                    <Stars>
                      {'★'.repeat(r.rating || 0)}
                      {'☆'.repeat(5 - (r.rating || 0))}
                    </Stars>
                  </div>
                </Row>

                {r.book && (
                  <BookRow>
                    <img
                      src={getUrl(r.book?.coverImage)}
                      alt={r.book?.title}
                      loading='lazy'
                    />
                    <Link to={`/books/${r.book?._id}`}>{r.book?.title}</Link>
                  </BookRow>
                )}

                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {r.comment || r.description || '(Sin comentario)'}
                </div>

                <Footer>
                  <span>
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString()
                      : ''}
                  </span>
                </Footer>
              </Card>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Pager>
              <PageBtn
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                ‹ Anterior
              </PageBtn>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <PageBtn
                  key={n}
                  $active={n === page}
                  onClick={() => setPage(n)}
                >
                  {n}
                </PageBtn>
              ))}

              <PageBtn
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Siguiente ›
              </PageBtn>
            </Pager>
          )}
        </>
      )}
    </Page>
  )
}
