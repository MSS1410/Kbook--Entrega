import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const Wrap = styled.section`
  position: relative;
  border: 1px solid ${({ theme }) => theme.colors?.primary || '#8b5cf6'};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  overflow: hidden;
`

const TitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`
const Title = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.lg};
`

const ViewAll = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`

const Outer = styled.div`
  overflow: hidden;
  position: relative;
`
const Track = styled.div`
  display: flex;
  gap: ${(p) => p.$gap}px;
  align-items: stretch;
  scroll-behavior: smooth;
`

const Card = styled(Link)`
  flex: 0 0 auto;
  width: ${(p) => p.$w}px;
  height: ${(p) => p.$h}px;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
  }

  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

const Arrow = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${(p) => (p.$left ? 'left: 8px;' : 'right: 8px;')}
  background: rgba(255,255,255,0.95);
  border: none;
  border-radius: 999px;
  padding: 8px;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  @media (max-width: 640px) {
    display: none;
  }
`

export default function AuthorBooksCarousel({
  title,
  items,
  viewAllLink,
  itemWidth = 128,
  itemHeight = 192,
  itemGap = 8
}) {
  const outerRef = useRef(null)
  const trackRef = useRef(null)
  const [showArrows, setShowArrows] = useState(false)

  useEffect(() => {
    const calc = () => {
      const outer = outerRef.current
      const track = trackRef.current
      if (!outer || !track) return
      // Flechas solo si hay más de 1 y hay overflow
      setShowArrows(items.length > 1 && track.scrollWidth > outer.clientWidth)
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [items])

  const scrollBy = (dir) => {
    const outer = outerRef.current
    if (!outer) return
    const step = outer.clientWidth * 0.85
    outer.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  const showViewAll = Boolean(viewAllLink) && items.length > 1

  return (
    <Wrap>
      <TitleBar>
        <Title>{title}</Title>
        {showViewAll && <ViewAll to={viewAllLink}>Ver todos</ViewAll>}
      </TitleBar>

      {showArrows && (
        <>
          <Arrow $left onClick={() => scrollBy(-1)} aria-label='Anterior'>
            <FiChevronLeft />
          </Arrow>
          <Arrow onClick={() => scrollBy(1)} aria-label='Siguiente'>
            <FiChevronRight />
          </Arrow>
        </>
      )}

      <Outer ref={outerRef}>
        <Track ref={trackRef} $gap={itemGap}>
          {items.map((it) => (
            <Card key={it.id} to={it.link} $w={itemWidth} $h={itemHeight}>
              {it.component}
            </Card>
          ))}
        </Track>
      </Outer>
    </Wrap>
  )
}
