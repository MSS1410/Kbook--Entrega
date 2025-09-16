// frontend/src/features/books/BooksPage.jsx
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../../api'
import { FiGrid, FiList } from 'react-icons/fi'
import useCart from '../../hooks/useCart'

/* ============== contenedor ============== */
const Page = styled.div`
  max-width: 1100px;
  margin: 2rem auto;
  padding: ${({ theme }) => theme.spacing.lg};
`

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const H1 = styled.h1`
  margin: 0;
  font-size: 1.4rem;
`

const Tools = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const ToggleGroup = styled.div`
  display: inline-flex;
  border: 1px solid #e6e6e8;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
`
const ToggleBtn = styled.button`
  padding: 6px 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  border: none;
  background: ${({ active }) => (active ? '#f2f2f6' : 'transparent')};
  color: ${({ active }) => (active ? '#111' : '#555')};
  cursor: pointer;

  &:not(:last-child) {
    border-right: 1px solid #e6e6e8;
  }
`

const ResultCount = styled.div`
  color: #666;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const Empty = styled.div`
  padding: 2rem 0;
  color: #666;
`

/* ============== vista LISTA (horizontal) ============== */
const ListWrap = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`

const RowCard = styled.article`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid #ececec;
  border-radius: ${({ theme }) => theme.radii.md};
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  @media (max-width: 640px) {
    grid-template-columns: 90px 1fr;
  }
`

const ThumbWrap = styled.div`
  width: 120px;
  aspect-ratio: 3/4;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f3f3;

  @media (max-width: 640px) {
    width: 90px;
  }
`
const Thumb = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`

const RowInfo = styled.div`
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  min-width: 0;
`

const TitleLink = styled(Link)`
  font-weight: 700;
  font-size: 1.05rem;
  color: #111;
  text-decoration: none;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`

const Meta = styled.div`
  color: #555;
  font-size: 0.9rem;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
`
const Badge = styled.span`
  background: #f6f6f6;
  border: 1px solid #eee;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 0.75rem;
  color: #444;
`

const Excerpt = styled.p`
  margin: 0;
  color: #444;
  font-size: 0.95rem;
  line-height: 1.35;
  max-height: 3.9em; /* ~3 líneas */
  overflow: hidden;
`

const BottomRow = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`

const Price = styled.div`
  font-weight: 700;
  font-size: 1rem;
`

const BtnRow = styled.div`
  display: inline-flex;
  gap: 8px;
`

const Cta = styled(Link)`
  padding: 8px 12px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
`

const AddBtn = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e6e6e8;
  background: #fff;
  color: #111;
  font-size: 0.8rem; /* ← arreglado (antes tenía un espacio "0.4 rem") */
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: #f7f7fa;
  }
`

/* ============== vista REJILLA (catálogo) ============== */
const GridWrap = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(5, 1fr);

  @media (max-width: 1100px) {
    grid-template-columns: repeat(4, 1fr);
  }
  @media (max-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const GridCard = styled.article`
  display: flex;
  flex-direction: column;
  border: 1px solid #ececec;
  border-radius: 16px;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
`

const GridThumb = styled.div`
  width: 100%;
  aspect-ratio: 3/4;
  background: #f3f3f3;
  overflow: hidden;

  & > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.25s ease;
  }

  ${GridCard}:hover & > img {
    transform: scale(1.03);
  }
`

const GridBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 12px 14px;
  min-height: 180px;
  text-align: center;
`

const GridTitle = styled(Link)`
  font-weight: 800;
  font-size: 1rem;
  color: #111;
  text-decoration: none;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.6em;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`

const GridAuthor = styled.div`
  color: #666;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-height: 1.2em;
`

const GridFooter = styled.div`
  margin-top: auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
`

const GridPrice = styled.div`
  font-weight: 900;
  font-size: 1.05rem;
`

const GridBtns = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
`
const GridAdd = styled.button`
  padding: 8px 10px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border: none;
  font-weight: 500;
  font-size: 0.8rem;
  cursor: pointer;
`

/* ============== helpers ============== */
function useQueryParams() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}
const getAuthorName = (a) => (typeof a === 'string' ? a : a?.name || '')
const pickMinPrice = (formats) => {
  if (!Array.isArray(formats) || !formats.length) return null
  let min = formats[0].price
  for (let i = 1; i < formats.length; i++)
    if (formats[i].price < min) min = formats[i].price
  return min
}
const excerpt = (s, n = 180) => {
  if (!s) return ''
  if (s.length <= n) return s
  const cut = s.slice(0, n)
  const space = cut.lastIndexOf(' ')
  return (space > 0 ? cut.slice(0, space) : cut) + '…'
}
const chooseFormat = (book) => {
  const list = Array.isArray(book?.formats) ? book.formats : []
  const fav = list.find((f) => f.type === 'TapaBlanda') || list[0]
  return fav || null
}

/* ============== página ============== */
export default function BooksPage() {
  const qp = useQueryParams()
  const navigate = useNavigate()
  const q = qp.get('search') || ''

  const urlView = qp.get('view')
  const [view, setView] = useState(
    urlView || localStorage.getItem('booksView') || 'list'
  )

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)

  // 👇 añadimos openDrawer desde el hook (ver nota 2)
  const { addOrUpdate, openDrawer } = useCart()

  // sincroniza vista con URL + storage
  useEffect(() => {
    localStorage.setItem('booksView', view)
    const params = new URLSearchParams(window.location.search)
    if (view) params.set('view', view)
    if (q) params.set('search', q)
    navigate({ search: params.toString() }, { replace: true })
  }, [view, q, navigate])

  // carga resultados
  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const { data } = await api.get('/api/books', {
          params: { search: q, limit: 60 }
        })
        const books = Array.isArray(data)
          ? data
          : Array.isArray(data?.books)
          ? data.books
          : []
        setItems(books)
        setTotal(typeof data?.total === 'number' ? data.total : books.length)
      } catch (e) {
        console.error(e)
        setError('No pudimos cargar los libros.')
      } finally {
        setLoading(false)
      }
    })()
  }, [q])

  const handleAdd = async (book) => {
    const fmt = chooseFormat(book)
    if (!fmt) return navigate(`/books/${book._id}`) // sin formato -> detalle
    try {
      // 👉 usa la firma REAL de tu hook (bookId/format/quantity)
      await addOrUpdate({ bookId: book._id, format: fmt.type, quantity: 1 })
      // 👉 abre el cajón (si existe el helper) o lanza el evento global
      if (typeof openDrawer === 'function') openDrawer()
      else window.dispatchEvent(new Event('cart:open'))
    } catch (err) {
      console.error('No se pudo añadir al carrito, abriendo detalle…', err)
      navigate(`/books/${book._id}`)
    }
  }

  return (
    <Page>
      <HeaderRow>
        <H1>{q ? `Resultados para “${q}”` : 'Libros'}</H1>
        <Tools>
          <ToggleGroup role='tablist' aria-label='Cambiar vista'>
            <ToggleBtn
              type='button'
              active={view === 'list'}
              aria-pressed={view === 'list'}
              onClick={() => setView('list')}
              title='Vista lista'
            >
              <FiList /> Lista
            </ToggleBtn>
            <ToggleBtn
              type='button'
              active={view === 'grid'}
              aria-pressed={view === 'grid'}
              onClick={() => setView('grid')}
              title='Vista rejilla'
            >
              <FiGrid /> Rejilla
            </ToggleBtn>
          </ToggleGroup>
        </Tools>
      </HeaderRow>

      {!!q && (
        <ResultCount>
          {total} resultado{total === 1 ? '' : 's'}
        </ResultCount>
      )}

      {loading && <div>Cargando…</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      {!loading && !error && items.length === 0 && (
        <Empty>
          Sin resultados. Prueba con otro término o revisa la ortografía.
        </Empty>
      )}

      {/* ===== LISTA ===== */}
      {view === 'list' && (
        <ListWrap>
          {items.map((b) => {
            const cover = b.coverImage || b.cover || b.coverImageUrl || ''
            const authorName = getAuthorName(b.author)
            const minPrice = pickMinPrice(b.formats)
            return (
              <RowCard key={b._id}>
                <ThumbWrap>
                  {cover ? (
                    <Thumb
                      src={cover}
                      alt={b.title}
                      onError={(e) =>
                        (e.currentTarget.style.visibility = 'hidden')
                      }
                    />
                  ) : null}
                </ThumbWrap>

                <RowInfo>
                  <TitleLink to={`/books/${b._id}`}>{b.title}</TitleLink>
                  <Meta>
                    {authorName && <span>{authorName}</span>}
                    {b.category && <Badge>{b.category}</Badge>}
                  </Meta>
                  <Excerpt>{excerpt(b.synopsis)}</Excerpt>

                  <BottomRow>
                    <Price>
                      {minPrice != null ? `Desde ${minPrice.toFixed(2)} €` : ''}
                    </Price>
                    <BtnRow>
                      <AddBtn
                        onClick={() => handleAdd(b)}
                        aria-label='Añadir al carrito'
                      >
                        Añadir al carrito
                      </AddBtn>
                      <Cta to={`/books/${b._id}`}>Ver detalle</Cta>
                    </BtnRow>
                  </BottomRow>
                </RowInfo>
              </RowCard>
            )
          })}
        </ListWrap>
      )}

      {/* ===== REJILLA ===== */}
      {view === 'grid' && (
        <GridWrap>
          {items.map((b) => {
            const cover = b.coverImage || b.cover || b.coverImageUrl || ''
            const authorName = getAuthorName(b.author)
            const minPrice = pickMinPrice(b.formats)
            return (
              <GridCard key={b._id}>
                <GridThumb>
                  {cover ? (
                    <img
                      src={cover}
                      alt={b.title}
                      onError={(e) =>
                        (e.currentTarget.style.visibility = 'hidden')
                      }
                    />
                  ) : null}
                </GridThumb>
                <GridBody>
                  <GridTitle to={`/books/${b._id}`}>{b.title}</GridTitle>
                  <GridAuthor>{authorName}</GridAuthor>
                  <GridFooter>
                    <GridPrice>
                      {minPrice != null ? `${minPrice.toFixed(2)} €` : ''}
                    </GridPrice>
                    <GridBtns>
                      <GridAdd
                        onClick={() => handleAdd(b)}
                        aria-label='Añadir al carrito'
                      >
                        Añadir al carrito
                      </GridAdd>
                    </GridBtns>
                  </GridFooter>
                </GridBody>
              </GridCard>
            )
          })}
        </GridWrap>
      )}
    </Page>
  )
}
