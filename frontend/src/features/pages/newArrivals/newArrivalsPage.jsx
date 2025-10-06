// frontend/src/features/shop/pages/NewArrivalsPage.jsx
import React, { useEffect, useState } from 'react'
import api from '../../../api'
import BookCatalogView from '../../Books/BookCatalogView'

const pickBooksArray = (data) => {
  if (Array.isArray(data?.books)) return data.books
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data)) return data
  return []
}

export default function NewArrivalsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        // Pedimos descendente y un lote grande para asegurar que entran los nuevos
        const { data } = await api.get('/api/books', {
          params: { sort: '-createdAt', limit: 200 }
        })
        const list = pickBooksArray(data)

        // ✅ Red de seguridad en cliente: ordenar por createdAt DESC y limitar a 60
        const newest = list
          .slice()
          .sort(
            (a, b) =>
              new Date(b?.createdAt || 0).getTime() -
              new Date(a?.createdAt || 0).getTime()
          )
          .slice(0, 60)

        setItems(newest)
      } catch (e) {
        console.error(e)
        setError('No pudimos cargar las nuevas publicaciones.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <div style={{ padding: 24 }}>Cargando…</div>
  if (error) return <div style={{ padding: 24, color: 'crimson' }}>{error}</div>

  return <BookCatalogView title='Nuevas Publicaciones' items={items} />
}
