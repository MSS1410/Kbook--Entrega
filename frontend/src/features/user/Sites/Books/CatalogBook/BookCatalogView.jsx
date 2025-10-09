import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import useCart from '../../../../../hooks/useCart'
import api from '../../../../../api'
import useScrollToTopOn from '../../../../../hooks/useScrollToTopOn'

// Presentacionales (solo UI)
import CatalogHeader from './catalogComponents/CatalogHeader'
import CatalogListItem from './catalogComponents/CatalogListItem'
import CatalogGridItem from './catalogComponents/CatalogGridItem'
import Pager from './catalogComponents/Pager'

/* ===== Layout y contenedores ===== */
const Wrap = styled.div`
  max-width: 1100px;
  margin: 2rem auto;
  padding: ${({ theme }) => theme.spacing.lg};
`
const ResultCount = styled.div`
  color: #666;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`
const Empty = styled.div`
  padding: 2rem 0;
  color: #666;
`
const ListWrap = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`
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

/* ===== Helpers internos ===== */
const pickMinPrice = (formats) => {
  if (!Array.isArray(formats) || !formats.length) return null
  let min = formats[0].price
  for (let i = 1; i < formats.length; i++)
    if (formats[i].price < min) min = formats[i].price
  return min
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
    const formats = Array.isArray(book?.formats) ? book.formats : []
    let fmt =
      (preferType && formats.find((f) => f.type === preferType)) ||
      formats.find((f) => f.type === 'TapaBlanda') ||
      formats[0] ||
      null

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

    if (!fmt?.type) {
      alert('Este libro no tiene formatos disponibles ahora mismo.')
      return
    }

    try {
      await addOrUpdate({
        bookId: book._id,
        format: fmt.type,
        quantity: 1
      })
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
      <CatalogHeader title={title} view={view} onSetView={setView} />

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
            const selType = selectedType(b)
            const selFmt = findFmt(b, selType)
            const price = selFmt?.price ?? pickMinPrice(getFormats(b)) ?? null

            return (
              <CatalogListItem
                key={b._id}
                book={b}
                formats={getFormats(b)}
                selectedType={selType}
                price={price}
                onChangeType={(type) =>
                  setChoice((prev) => ({ ...prev, [b._id]: type }))
                }
                onAdd={() => handleAdd(b, selType)}
              />
            )
          })}
        </ListWrap>
      )}

      {/* REJILLA */}
      {view === 'grid' && !!total && (
        <GridWrap>
          {visible.map((b) => {
            const selType = selectedType(b)
            const selFmt = findFmt(b, selType)
            const price = selFmt?.price ?? pickMinPrice(getFormats(b)) ?? null

            return (
              <CatalogGridItem
                key={b._id}
                book={b}
                formats={getFormats(b)}
                selectedType={selType}
                price={price}
                onChangeType={(type) =>
                  setChoice((prev) => ({ ...prev, [b._id]: type }))
                }
                onAdd={() => handleAdd(b, selType)}
              />
            )
          })}
        </GridWrap>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <Pager
          page={page}
          pages={pages}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          onGoto={(p) => setPage(p)}
        />
      )}
    </Wrap>
  )
}
