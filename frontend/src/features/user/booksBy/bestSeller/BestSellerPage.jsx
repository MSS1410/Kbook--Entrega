import React, { useEffect, useState } from 'react'
import api from '../../../../api'
import BookCatalogView from '../../Sites/Books/CatalogBook/BookCatalogView'

const pickBooksArray = (data) => {
  if (Array.isArray(data?.books)) return data.books
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data)) return data
  return []
}

export default function BestSellerPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        // Pedimos bastantes por si el backend devuelve muchos con soldCount=0
        const { data } = await api.get('/api/books', {
          params: { sort: '-soldCount', limit: 200 }
        })
        const list = pickBooksArray(data)

        // ✅ Filtro y orden en cliente: solo soldCount > 0, orden desc
        const cleaned = list
          .filter((b) => Number(b?.soldCount ?? 0) > 0)
          .sort((a, b) => Number(b?.soldCount ?? 0) - Number(a?.soldCount ?? 0))
          .slice(0, 60)

        setItems(cleaned)
      } catch (e) {
        console.error(e)
        setError('No pudimos cargar los más vendidos.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <div style={{ padding: 24 }}>Cargando…</div>
  if (error) return <div style={{ padding: 24, color: 'crimson' }}>{error}</div>

  return <BookCatalogView title='Más Vendidos' items={items} />
}
