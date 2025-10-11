import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../../../../api'
import useCart from '../../../../../hooks/useCart'

// take em here
import Header from './pageComponents/Header'
import SearchListItem from './pageComponents/SearchListItem'
import SearchGridItem from './pageComponents/SearchGridItem'

/*  contenedor  */
const Page = styled.div`
  max-width: 1100px;
  margin: 2rem auto;
  padding: ${({ theme }) => theme.spacing.lg};
`
const ResultCount = styled.div`
  color: #666;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`
const Empty = styled.div`
  padding: 2rem 0;
  color: #666;
`

/*  contenedores de lista/rejilla  */
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

/*  helpers  */
// devuelve URLSearchParams from useMemo
function useQueryParams() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

// precio minimo del array de formatos / null
const pickMinPrice = (formats) => {
  if (!Array.isArray(formats) || !formats.length) return null
  let min = formats[0].price
  for (let i = 1; i < formats.length; i++)
    if (formats[i].price < min) min = formats[i].price
  return min
}
// eleccion de formato a tapa blanda, sino primer formato
const chooseFormat = (book) => {
  const list = Array.isArray(book?.formats) ? book.formats : []
  const fav = list.find((f) => f.type === 'TapaBlanda') || list[0]
  return fav || null
}
// pagina de busqueda/listado de libros con:
// lista o cuadricula
// carga desde /api/books?search=<q>&limit=60
// addToCart con formato ya elegido, o con el que lleva default

/*  page  */
export default function BooksPage() {
  // estado principal
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

  const { addOrUpdate, openDrawer } = useCart()

  // sincroniza vista con URL + storage
  useEffect(() => {
    localStorage.setItem('booksView', view)
    const params = new URLSearchParams(window.location.search)
    if (view) params.set('view', view)
    if (q) params.set('search', q)
    navigate({ search: params.toString() }, { replace: true })
    // mantiene vista actual en storage y en query string
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
        // normalizamos la respuesta a array y nos quedamos con el total
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

  // Añadir al carrito
  const handleAdd = async (book) => {
    const fmt = chooseFormat(book)
    if (!fmt) return navigate(`/books/${book._id}`) // si no viene con formato mando usuario al detalle para que lo eliga y añada libro desde ahi al carrito
    try {
      await addOrUpdate({ bookId: book._id, format: fmt.type, quantity: 1 })
      if (typeof openDrawer === 'function') openDrawer()
      else window.dispatchEvent(new Event('cart:open'))
    } catch (err) {
      console.error('No se pudo añadir al carrito, abriendo detalle…', err)
      // fallo = detalle
      navigate(`/books/${book._id}`)
    }
  }

  return (
    <Page>
      <Header
        // header con selector de vista
        title={q ? `Resultados para “${q}”` : 'Libros'}
        view={view}
        onSetView={setView}
      />

      {!!q && (
        // si q, contador de resultados
        <ResultCount>
          {total} resultado{total === 1 ? '' : 's'}
        </ResultCount>
      )}
      {/* estados loading/ error / vacio */}
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
          {items.map((b) => (
            <SearchListItem
              key={b._id}
              book={b}
              minPrice={pickMinPrice(b.formats)}
              onAdd={() => handleAdd(b)}
            />
          ))}
        </ListWrap>
      )}

      {/* ===== REJILLA ===== */}
      {view === 'grid' && (
        <GridWrap>
          {items.map((b) => (
            <SearchGridItem
              key={b._id}
              book={b}
              minPrice={pickMinPrice(b.formats)}
              onAdd={() => handleAdd(b)}
            />
          ))}
        </GridWrap>
      )}
    </Page>
  )
}
