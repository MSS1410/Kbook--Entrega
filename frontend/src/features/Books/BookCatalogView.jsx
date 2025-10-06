// frontend/src/features/Books/BookCatalogView.jsx
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Link, useNavigate } from 'react-router-dom'
import { FiGrid, FiList } from 'react-icons/fi'
import useCart from '../../hooks/useCart'
import api from '../../api'
import useScrollToTopOn from '../../hooks/useScrollToTopOn'

/* ===== Layout y header ===== */
const Wrap = styled.div`
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
  gap: 10px;
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
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const Empty = styled.div`
  padding: 2rem 0;
  color: #666;
`

/* ===== LISTA ===== */
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
  grid-template-rows: auto auto auto auto;
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
  margin: 0 0 8px 0;
  color: #444;
  font-size: 0.95rem;
  line-height: 1.35;
  max-height: 3.9em; /* ~3 líneas */
  overflow: hidden;
`

const BottomRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
`

/* === Selector de formato + precio (reutilizado en ambas vistas) === */
const FormatRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`
const FormatSelect = styled.select`
  appearance: none;
  padding: 6px 10px;
  border: 1px solid #e6e6e8;
  border-radius: 8px;
  background: #fff;
  color: #111;
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    background: #f7f7fa;
  }
`
const Price = styled.div`
  font-weight: 700;
  font-size: 1rem;
`

const BtnRow = styled.div`
  display: inline-flex;
  gap: 8px;
`

const AddBtn = styled.button`
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid #e6e6e8;
  background: #fff;
  color: #111;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: #f7f7fa;
  }
`

const Cta = styled(Link)`
  padding: 7px 10px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  text-decoration: none;
  font-weight: 500;
  font-size: 0.8rem;
  white-space: nowrap;
`

/* ===== REJILLA ===== */
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
  min-height: 200px;
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
const GridBtns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`
const GridAdd = styled.button`
  padding: 5px 10px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border: none;
  font-weight: 500;
  font-size: 0.8rem;
  cursor: pointer;
`
const GridDetail = styled(Link)`
  padding: 5px 10px;
  border-radius: 10px;
  background: #f5f5f7;
  color: #111;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
`

/* ===== Paginación ===== */
const PagerWrap = styled.nav`
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 20px;
  flex-wrap: wrap;
`

const PageBtn = styled.button`
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid #e6e6e8;
  background: ${({ active }) => (active ? '#111' : '#fff')};
  color: ${({ active }) => (active ? '#fff' : '#333')};
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: ${({ active }) => (active ? '#111' : '#f6f6fa')};
  }
`

const PageEllipsis = styled.span`
  min-width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  color: #888;
`

/* ===== Helpers ===== */
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
  return list.find((f) => f.type === 'TapaBlanda') || list[0] || null
}

/* ===== Paginación: páginas con elipsis ===== */
function usePagination(page, totalPages, delta = 1) {
  return useMemo(() => {
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
}

/* ===== Componente principal ===== */
export default function BookCatalogView({
  title = 'Libros',
  items = [],
  initialView = 'list',
  pageSize = 10
}) {
  const navigate = useNavigate()
  const { addOrUpdate, openDrawer } = useCart()

  const [view, setView] = useState(
    () => localStorage.getItem('booksView') || initialView
  )
  const [page, setPage] = useState(1)

  // Estado: formato elegido por libro { [bookId]: 'TapaBlanda' | 'TapaDura' | 'Ebook' }
  const [choice, setChoice] = useState({})
  useScrollToTopOn(page)
  useEffect(() => {
    localStorage.setItem('booksView', view)
  }, [view])

  // paginación cliente
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  useEffect(() => {
    if (page > totalPages) setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages])

  const sliceStart = (page - 1) * pageSize
  const visible = items.slice(sliceStart, sliceStart + pageSize)
  const pages = usePagination(page, totalPages, 1)

  // helpers de formato por item
  const getFormats = (b) => (Array.isArray(b?.formats) ? b.formats : [])
  const defaultType = (b) =>
    getFormats(b).find((f) => f.type === 'TapaBlanda')?.type ||
    getFormats(b)[0]?.type ||
    null
  const selectedType = (b) => choice[b._id] || defaultType(b)
  const findFmt = (b, type) =>
    getFormats(b).find((f) => f.type === type) || null

  // Añadir al carrito con formato seleccionado; si no viene, intenta fetch del libro por id
  const handleAdd = async (book, preferType) => {
    // 1) Intenta resolver el formato según el select o un fallback sensato
    const formats = Array.isArray(book?.formats) ? book.formats : []
    let fmt =
      (preferType && formats.find((f) => f.type === preferType)) ||
      formats.find((f) => f.type === 'TapaBlanda') ||
      formats[0] ||
      null

    // 2) Si la lista no traía formatos, pide el libro por id y vuelve a intentar
    if (!fmt) {
      try {
        const { data } = await api.get(`/api/books/${book._id}`)
        const full = data?.book || data
        const fl = Array.isArray(full?.formats) ? full.formats : []
        fmt =
          (preferType && fl.find((f) => f.type === preferType)) ||
          fl.find((f) => f.type === 'TapaBlanda') ||
          fl[0] ||
          null
      } catch (e) {
        console.warn('No se pudieron obtener formatos por id:', e)
      }
    }

    // 3) Si AÚN no hay formato, no navegamos al detalle: avisamos y salimos
    if (!fmt?.type) {
      alert('Este libro no tiene formatos disponibles ahora mismo.')
      return
    }

    // 4) Añadir + abrir carrito; en 401 redirige a login con retorno
    try {
      await addOrUpdate({
        bookId: book._id,
        format: fmt.type,
        quantity: 1
      })

      // Abre aside del carrito (usa el helper del hook; fallback por si acaso)
      if (typeof openDrawer === 'function') openDrawer()
      else window.dispatchEvent(new Event('cart:open'))
    } catch (e) {
      const status = e?.response?.status
      if (status === 401) {
        const next = encodeURIComponent(
          window.location.pathname + window.location.search
        )
        navigate(`/login?next=${next}`)
      } else {
        console.error('No se pudo añadir al carrito', e)
        alert('No se pudo añadir al carrito. Inténtalo de nuevo.')
      }
    }
  }

  return (
    <Wrap>
      <HeaderRow>
        <H1>{title}</H1>
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

      <ResultCount>
        {total} resultado{total === 1 ? '' : 's'} · Mostrando{' '}
        {Math.min(total, sliceStart + 1)}–
        {Math.min(total, sliceStart + visible.length)}
      </ResultCount>

      {!total && <Empty>Sin resultados.</Empty>}

      {/* LISTA */}
      {view === 'list' && !!total && (
        <ListWrap>
          {visible.map((b) => {
            const cover = b.coverImage || b.cover || b.coverImageUrl || ''
            const authorName = getAuthorName(b.author)
            const selType = selectedType(b)
            const selFmt = findFmt(b, selType)
            const price = selFmt?.price ?? pickMinPrice(getFormats(b)) ?? null

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

                  <Excerpt>
                    {b.synopsis && b.synopsis.slice ? excerpt(b.synopsis) : ''}
                  </Excerpt>

                  <BottomRow>
                    <FormatRow>
                      {/* Select de formato (si hay formatos) */}
                      {getFormats(b).length > 0 && (
                        <FormatSelect
                          value={selType || ''}
                          onChange={(e) =>
                            setChoice((prev) => ({
                              ...prev,
                              [b._id]: e.target.value
                            }))
                          }
                          aria-label='Elegir formato'
                        >
                          {getFormats(b).map((f) => (
                            <option key={f.type} value={f.type}>
                              {f.label || f.type}
                            </option>
                          ))}
                        </FormatSelect>
                      )}

                      <Price>
                        {price != null ? `${price.toFixed(2)} €` : ''}
                      </Price>
                    </FormatRow>

                    <BtnRow>
                      <AddBtn
                        onClick={() => handleAdd(b, selType)}
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

      {/* REJILLA */}
      {view === 'grid' && !!total && (
        <GridWrap>
          {visible.map((b) => {
            const cover = b.coverImage || b.cover || b.coverImageUrl || ''
            const authorName = getAuthorName(b.author)
            const selType = selectedType(b)
            const selFmt = findFmt(b, selType)
            const price = selFmt?.price ?? pickMinPrice(getFormats(b)) ?? null

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

                  {/* Select + precio también en rejilla */}
                  <FormatRow style={{ justifyContent: 'center' }}>
                    {getFormats(b).length > 0 && (
                      <FormatSelect
                        value={selType || ''}
                        onChange={(e) =>
                          setChoice((prev) => ({
                            ...prev,
                            [b._id]: e.target.value
                          }))
                        }
                        aria-label='Elegir formato'
                      >
                        {getFormats(b).map((f) => (
                          <option key={f.type} value={f.type}>
                            {f.label || f.type}
                          </option>
                        ))}
                      </FormatSelect>
                    )}
                    <Price>
                      {price != null ? `${price.toFixed(2)} €` : ''}
                    </Price>
                  </FormatRow>

                  <GridFooter>
                    <GridBtns>
                      <GridAdd
                        onClick={() => handleAdd(b, selType)}
                        aria-label='Añadir al carrito'
                      >
                        Añadir al carrito
                      </GridAdd>
                      <GridDetail to={`/books/${b._id}`}>Detalle</GridDetail>
                    </GridBtns>
                  </GridFooter>
                </GridBody>
              </GridCard>
            )
          })}
        </GridWrap>
      )}

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

          {pages.map((p, idx) =>
            p === '…' ? (
              <PageEllipsis key={`e-${idx}`}>…</PageEllipsis>
            ) : (
              <PageBtn
                key={p}
                active={p === page}
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
    </Wrap>
  )
}
