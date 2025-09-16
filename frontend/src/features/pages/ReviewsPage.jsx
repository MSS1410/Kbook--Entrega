// frontend/src/features/pages/ReviewsPage.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import api from '../../api'

/* ============ Layout & Header ============ */
const Wrap = styled.div`
  max-width: 1100px;
  margin: 2rem auto;
  padding: ${({ theme }) => theme.spacing.lg};
`

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`

const H1 = styled.h1`
  margin: 0;
  font-size: 1.6rem;
`

const SearchBox = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #e6e6e8;
  border-radius: 12px;
  padding: 8px 10px;
  min-width: 320px;
`
const SearchInput = styled.input`
  border: 0;
  outline: none;
  font-size: 0.98rem;
  flex: 1;
`

const ResultInfo = styled.div`
  color: #666;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

/* ============ Grid ============ */
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
`

/* ============ Card grande ============ */
const Card = styled.article`
  border: 1px solid #ececec;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
  padding: 14px;
  display: grid;
  grid-template-rows: auto auto 1fr;
  min-height: 280px; /* ≈ el doble que antes */
`

const Head = styled.div`
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
`

const Cover = styled.img`
  width: 72px;
  height: 102px;
  object-fit: cover;
  border-radius: 8px;
  background: #f0f0f0;
`

const BookTitle = styled(Link)`
  font-weight: 800;
  font-size: 1.05rem;
  color: #111;
  text-decoration: none;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* corta solo el título si es muy largo */
  -webkit-box-orient: vertical;
  overflow: hidden;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`

const Sub = styled.div`
  margin-top: 4px;
  color: #666;
  font-size: 0.9rem;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`

const Stars = styled.div`
  display: inline-flex;
  font-size: 1rem;
  color: #f39c12;
`

const Body = styled.div`
  margin-top: 8px;
  color: #333;
  line-height: 1.5;
  /* 🔓 reseña completa: sin cortes ni clamping */
  white-space: pre-wrap;
`

const MetaRow = styled.div`
  margin-top: 12px;
  font-size: 0.85rem;
  color: #777;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
`

/* ============ Paginación ============ */
const PagerWrap = styled.nav`
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 22px;
  flex-wrap: wrap;
`

const PageBtn = styled.button`
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid #e6e6e8;
  background: ${({ $active }) => ($active ? '#111' : '#fff')};
  color: ${({ $active }) => ($active ? '#fff' : '#333')};
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: ${({ $active }) => ($active ? '#111' : '#f6f6fa')};
  }

  &:disabled {
    opacity: 0.55;
    cursor: default;
  }
`

const PageEllipsis = styled.span`
  min-width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  color: #888;
`

/* ============ Utils ============ */
const useDebounced = (value, delay = 250) => {
  const [v, setV] = useState(value)
  const t = useRef()
  useEffect(() => {
    clearTimeout(t.current)
    t.current = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t.current)
  }, [value, delay])
  return v
}

const usePagination = (page, totalPages, delta = 1) =>
  useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const range = [1]
    const left = Math.max(2, page - delta)
    const right = Math.min(totalPages - 1, page + delta)
    if (left > 2) range.push('…')
    for (let i = left; i <= right; i++) range.push(i)
    if (right < totalPages - 1) range.push('…')
    range.push(totalPages)
    return range
  }, [page, totalPages, delta])

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString()
  } catch {
    return ''
  }
}

const makeStars = (n = 0) => {
  const full = '★'.repeat(Math.max(0, Math.min(5, Math.floor(n))))
  const empty = '☆'.repeat(5 - full.length)
  return full + empty
}

/* ============ Página ============ */
export default function ReviewsPage() {
  // Datos
  const [all, setAll] = useState([]) // todas las reseñas cargadas (cliente)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Filtro & paginación (cliente)
  const [q, setQ] = useState('')
  const debouncedQ = useDebounced(q, 300)
  const pageSize = 10
  const [page, setPage] = useState(1)

  // Carga inicial: muchas reseñas para poder filtrar en cliente
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const { data } = await api.get('/api/reviews', {
          params: { limit: 400, sort: '-createdAt' } // trae “muchas”
        })
        const arr = Array.isArray(data?.reviews)
          ? data.reviews
          : Array.isArray(data)
          ? data
          : []
        if (alive) setAll(arr)
      } catch (e) {
        console.error(e)
        if (alive) setError('No pudimos cargar las reseñas.')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  // Filtrado por título del libro
  const filtered = useMemo(() => {
    const term = debouncedQ.trim().toLowerCase()
    if (!term) return all
    return all.filter((r) =>
      String(r?.book?.title || '')
        .toLowerCase()
        .includes(term)
    )
  }, [all, debouncedQ])

  // Paginación cliente
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  useEffect(() => {
    // si cambias el término, vuelve a la primera página
    setPage(1)
  }, [debouncedQ])
  const start = (page - 1) * pageSize
  const visible = filtered.slice(start, start + pageSize)
  const pages = usePagination(page, totalPages, 1)

  return (
    <Wrap>
      <TopBar>
        <H1>Reseñas</H1>
        <SearchBox role='search'>
          <SearchInput
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Buscar por título de libro…'
            aria-label='Buscar reseñas por libro'
          />
        </SearchBox>
      </TopBar>

      <ResultInfo>
        {total} reseña{total === 1 ? '' : 's'} · Mostrando{' '}
        {Math.min(total, start + 1)}–{Math.min(total, start + visible.length)}
      </ResultInfo>

      {loading && <div>Cargando…</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}

      {!loading && !error && (
        <>
          <Grid>
            {visible.map((r) => (
              <Card key={r._id}>
                <Head>
                  {r?.book?.coverImage ? (
                    <Cover
                      src={r.book.coverImage}
                      alt={r.book.title}
                      onError={(e) =>
                        (e.currentTarget.style.visibility = 'hidden')
                      }
                    />
                  ) : (
                    <div
                      style={{
                        width: 72,
                        height: 102,
                        background: '#f3f3f3',
                        borderRadius: 8
                      }}
                    />
                  )}

                  <div>
                    <BookTitle to={`/books/${r?.book?._id || ''}`}>
                      {r?.book?.title || 'Libro'}
                    </BookTitle>
                    <Sub>
                      <span style={{ fontWeight: 700 }}>
                        {r?.user?.name || 'Usuario'}
                      </span>
                      <Stars aria-label={`${r.rating} de 5`}>
                        {makeStars(r.rating)}
                      </Stars>
                      <span>{formatDate(r?.createdAt)}</span>
                    </Sub>
                  </div>
                </Head>

                <Body>{r?.comment || 'Sin comentario.'}</Body>

                <MetaRow>
                  {/* Si guardaste el avatar en el doc de review, puedes mostrarlo */}
                  {r?.avatar ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <img
                        src={r.avatar}
                        alt={r?.user?.name || 'Avatar'}
                        width={22}
                        height={22}
                        style={{ borderRadius: '50%', objectFit: 'cover' }}
                        onError={(e) =>
                          (e.currentTarget.style.visibility = 'hidden')
                        }
                      />
                      {r?.user?.name || 'Usuario'}
                    </span>
                  ) : (
                    <span />
                  )}

                  {/* enlace al libro */}
                  <Link to={`/books/${r?.book?._id || ''}`}>Ver libro</Link>
                </MetaRow>
              </Card>
            ))}
          </Grid>

          {/* Paginación */}
          {totalPages > 1 && (
            <PagerWrap aria-label='Paginación'>
              <PageBtn
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label='Página anterior'
              >
                ‹
              </PageBtn>

              {pages.map((p, i) =>
                p === '…' ? (
                  <PageEllipsis key={`e-${i}`}>…</PageEllipsis>
                ) : (
                  <PageBtn
                    key={p}
                    $active={p === page}
                    aria-current={p === page ? 'page' : undefined}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </PageBtn>
                )
              )}

              <PageBtn
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label='Página siguiente'
              >
                ›
              </PageBtn>
            </PagerWrap>
          )}
        </>
      )}
    </Wrap>
  )
}
