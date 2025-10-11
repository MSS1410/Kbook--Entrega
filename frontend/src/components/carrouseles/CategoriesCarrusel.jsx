import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const Wrap = styled.section`
  margin: 24px 0;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;
`

const H2 = styled.h2`
  margin: 0;
`

const ViewAll = styled(Link)`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`

/* sin flechas ni scroll */
const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center; /* centrado si me caben en una fila */
`

const Slide = styled(Link)`
  flex: 0 0 auto;
  width: ${({ $diameter }) => $diameter}px;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Avatar = styled.img`
  width: ${({ $diameter }) => $diameter}px;
  height: ${({ $diameter }) => $diameter}px;
  border-radius: 50%;
  object-fit: cover;
  background: #f0f0f0;
  display: block;
`

const Fallback = styled.div`
  width: ${({ $diameter }) => $diameter}px;
  height: ${({ $diameter }) => $diameter}px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #f2f2f6;
  color: #555;
  font-weight: 800;
  font-size: 1.1rem;
`

const Name = styled.div`
  margin-top: 10px;
  font-weight: 700;
  font-size: 0.98rem;
  text-align: center;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

/* img fijas */
const DEFAULT_CATEGORIES = [
  { name: 'Ciencia Ficción', image: 'src/assets/images/cienciaFiccion.webp' },
  { name: 'Ciencia', image: 'src/assets/images/ciencia.jpg' },
  { name: 'Infantiles', image: 'src/assets/images/infantil.jpg' },
  { name: 'Aventuras', image: 'src/assets/images/aventuras.jpg' },
  { name: 'Historia', image: 'src/assets/images/historia.jpg' },
  { name: 'Psicologia', image: 'src/assets/images/psicologia.jpg' },
  { name: 'Natura', image: 'src/assets/images/Natura.jpg' }
]

/**
Props: tittle=categories / itemDiamt/ viewaLLlink, cateogires/defaultcategories
 */
export default function CategoriesCarousel({
  title = 'Categorías',
  itemDiameter = 160,
  viewAllLink = '/categories',
  categories: categoriesProp
}) {
  const [cats, setCats] = useState([])
  // estado cats= deriva categoriesProp o del default
  useEffect(() => {
    const source =
      Array.isArray(categoriesProp) && categoriesProp.length
        ? categoriesProp
        : DEFAULT_CATEGORIES
    setCats(
      source.map((c) => ({
        name: c.name || String(c),
        image: c.image || ''
      }))
    )
  }, [categoriesProp])

  if (!cats.length) return null

  return (
    <Wrap>
      <Header>
        {/* render de header con titulo y view all */}
        <H2>{title}</H2>
        <ViewAll to={viewAllLink}>Ver todos</ViewAll>
      </Header>

      <Grid>
        {/* grid flexible no carro no scroll. */}
        {cats.map((c) => (
          <Slide
            key={c.name}
            to={`/categories/${encodeURIComponent(c.name)}`}
            $diameter={itemDiameter}
            aria-label={`Ver ${c.name}`}
          >
            {c.image ? (
              <Avatar
                $diameter={itemDiameter}
                src={c.image}
                alt={c.name}
                onError={(e) => {
                  e.currentTarget.style.visibility = 'hidden'
                }}
              />
            ) : (
              <Fallback $diameter={itemDiameter}>{c.name.slice(0, 2)}</Fallback>
            )}
            <Name title={c.name}>{c.name}</Name>
          </Slide>
        ))}
      </Grid>
    </Wrap>
  )
}
