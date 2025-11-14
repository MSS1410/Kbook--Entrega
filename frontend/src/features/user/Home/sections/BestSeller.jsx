import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import api from '../../../../api'
import HomeCarrusel from '../../../../components/carrouseles/HomeCarrusels'

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
  // estado items
  useEffect(() => {
    // carga libros mas vendidos, 12
    ;(async () => {
      try {
        const { data } = await api.get('/api/books', {
          params: { sort: '-soldCount', limit: 24 }
        })
        // normalizo list, priorizo data.books, luego si data es array
        const list = Array.isArray(data?.books)
          ? data.books
          : Array.isArray(data)
          ? data
          : []
        const mapped = list.map((b) => {
          // mapeo items con id, link books:id
          const cover = b.coverImage || b.cover || b.coverImageUrl || ''
          return {
            id: b._id,
            link: `/books/${b._id}`,
            component: (
              // tarjeta con la portada
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
                  // sin items no cargo la seccion
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
    // render del carrusel con los libros mapeados, ancho y alto, 
      title='Más Vendidos'
      items={items}
      viewAllLink='/bestsellers'
      itemWidth={160}
      itemHeight={240}
      itemGap={8} // menos espacio entre libros
    />
  )
}
