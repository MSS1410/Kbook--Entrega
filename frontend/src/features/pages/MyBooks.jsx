// frontend/src/features/profile/MyBooks.jsx
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getMyBooks } from '../../api/users'
import api from '../../api/index'

const List = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 12px;
`
const Item = styled.li`
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
`
const Cover = styled.img`
  width: 72px;
  height: 96px;
  object-fit: cover;
  border-radius: 8px;
  background: #f1f1f1;
`
const Title = styled.h4`
  margin: 0;
  font-size: 16px;
  line-height: 1.25;
  color: #111;
`
const Meta = styled.p`
  margin: 4px 0 0;
  color: #555;
  font-size: 14px;
`

const baseURL = (api.defaults?.baseURL || '').replace(/\/$/, '')
const resolveCoverUrl = (coverImage) => {
  if (!coverImage) return null
  if (/^https?:\/\//i.test(coverImage)) return coverImage
  if (coverImage.startsWith('/uploads')) return `${baseURL}${coverImage}`
  return coverImage
}

export default function MyBooks({ open }) {
  const [loading, setLoading] = useState(false)
  const [books, setBooks] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open || books.length || loading) return
    ;(async () => {
      try {
        setLoading(true)
        const { data } = await getMyBooks()
        const arr = Array.isArray(data?.books) ? data.books : []
        setBooks(arr)
      } catch (e) {
        setError('No pudimos cargar tus libros.')
      } finally {
        setLoading(false)
      }
    })()
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null
  if (loading) return <p>Cargando tus libros…</p>
  if (error) return <p>{error}</p>
  if (!books.length) return <p>Aquí aparecerán los libros que compraste.</p>

  return (
    <List>
      {books.map((b) => {
        const src = resolveCoverUrl(b.coverImage)
        return (
          <Item key={`${b._id}-${b.purchasedAt}`}>
            <Cover
              src={src || '/placeholder-cover.png'}
              alt={`Portada de ${b.title}`}
              onError={(e) => {
                e.currentTarget.src = '/placeholder-cover.png'
              }}
            />
            <div>
              <Title>{b.title}</Title>
              <Meta>{b.author}</Meta>
              <Meta>
                Comprado el{' '}
                {b.purchasedAt
                  ? format(new Date(b.purchasedAt), "d 'de' MMMM yyyy", {
                      locale: es
                    })
                  : '-'}
              </Meta>
            </div>
          </Item>
        )
      })}
    </List>
  )
}
