import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import api from '../../api'
import HomeCarrusel from '../../components/HomeCarrusels'

const Card = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
`
const Cover = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
`
const Fallback = styled.div`
  width: 100%;
  height: 100%;
  background: #f0f0f0;
`

export default function BestsellerSection() {
  const [items, setItems] = useState([])

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.get('/api/books', {
          params: { sort: '-soldCount', limit: 24 }
        })
        const list = Array.isArray(data?.books)
          ? data.books
          : Array.isArray(data)
          ? data
          : []
        const mapped = list.map((b) => {
          const cover = b.coverImage || b.cover || b.coverImageUrl || ''
          return {
            id: b._id,
            link: `/books/${b._id}`,
            component: (
              <Card>
                {cover ? (
                  <Cover
                    src={cover}
                    alt={b.title}
                    onError={(e) =>
                      (e.currentTarget.style.visibility = 'hidden')
                    }
                  />
                ) : (
                  <Fallback />
                )}
              </Card>
            )
          }
        })
        setItems(mapped)
      } catch (e) {
        console.error('Error cargando más vendidos', e)
      }
    })()
  }, [])

  if (!items.length) return null

  return (
    <HomeCarrusel
      title='Más Vendidos'
      items={items}
      viewAllLink='/bestsellers'
      itemWidth={160}
      itemHeight={240}
      itemGap={8} // menos espacio entre libros
    />
  )
}
