import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api'
import BookCatalogView from '../Books/BookCatalogView'

export default function CategoryPage() {
  const { category } = useParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!category) return
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const { data } = await api.get('/api/books', {
          params: { category, limit: 60 }
        })
        const list = Array.isArray(data?.books)
          ? data.books
          : Array.isArray(data)
          ? data
          : []
        setItems(list)
      } catch (e) {
        console.error(e)
        setError('No pudimos cargar la categoría.')
      } finally {
        setLoading(false)
      }
    })()
  }, [category])

  if (loading) return <div style={{ padding: 24 }}>Cargando…</div>
  if (error) return <div style={{ padding: 24, color: 'crimson' }}>{error}</div>

  return (
    <BookCatalogView
      title={`Categoría: ${decodeURIComponent(category)}`}
      items={items}
    />
  )
}
