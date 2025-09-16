import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const Wrap = styled.section`
  margin: 24px 0;
  position: relative;
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

/* Viewport que recorta el track y permite el scroll programático */
const Viewport = styled.div`
  overflow-x: hidden;
  position: relative;
`

/* Pista con los slides; se centrará si no hay overflow */
const Track = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
  scroll-behavior: smooth;
  justify-content: ${({ $center }) => ($center ? 'center' : 'flex-start')};
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
  -webkit-line-clamp: 2; /* hasta 2 líneas */
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const NavBtn = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ $left }) => ($left ? 'left: 8px' : 'right: 8px')};
  border: none;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);

  @media (max-width: 640px) {
    display: none; /* en móvil, scroll táctil */
  }
`

/* ---- Imágenes fijas que pediste ---- */
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
 * Props:
 * - title?: string
 * - itemDiameter?: number (px) → tamaño del avatar circular
 * - viewAllLink?: string
 * - categories?: Array<{ name: string, image?: string }>
 *
 * Si no pasas `categories`, usará DEFAULT_CATEGORIES con tus imágenes.
 */
export default function CategoriesCarousel({
  title = 'Categorías',
  itemDiameter = 160,
  viewAllLink = '/categories',
  categories: categoriesProp
}) {
  const [cats, setCats] = useState([])
  const [center, setCenter] = useState(false)
  const viewportRef = useRef(null)
  const trackRef = useRef(null)

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

  // Centrar si no hay overflow (compara ancho del track con el del viewport)
  useEffect(() => {
    const vp = viewportRef.current
    const tr = trackRef.current
    if (!vp || !tr) return
    const check = () => setCenter(tr.scrollWidth <= vp.clientWidth)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [cats])

  const scrollBy = (dir) => {
    const vp = viewportRef.current
    if (!vp) return
    const step = vp.clientWidth * 0.9
    vp.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  if (!cats.length) return null

  return (
    <Wrap>
      <Header>
        <H2>{title}</H2>
        <ViewAll to={viewAllLink}>Ver todos</ViewAll>
      </Header>

      <Viewport ref={viewportRef}>
        <NavBtn $left onClick={() => scrollBy(-1)} aria-label='Anterior'>
          <FiChevronLeft />
        </NavBtn>

        <Track ref={trackRef} $center={center}>
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
                <Fallback $diameter={itemDiameter}>
                  {c.name.slice(0, 2)}
                </Fallback>
              )}
              <Name title={c.name}>{c.name}</Name>
            </Slide>
          ))}
        </Track>

        <NavBtn onClick={() => scrollBy(1)} aria-label='Siguiente'>
          <FiChevronRight />
        </NavBtn>
      </Viewport>
    </Wrap>
  )
}
