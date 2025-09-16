import React, { useEffect, useState } from 'react'
import api from '../../api'
import BookCatalogView from '../Books/BookCatalogView'

export default function BestSellerPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const { data } = await api.get('/api/books', {
          params: { sort: 'soldCount', limit: 60 }
        })
        const list = Array.isArray(data?.books)
          ? data.books
          : Array.isArray(data)
          ? data
          : []
        setItems(list)
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
