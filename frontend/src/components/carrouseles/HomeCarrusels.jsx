import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const Wrapper = styled.section`
  position: relative;
  background: ${({ theme }) => theme.colors.surfaceVariant};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  margin: ${({ theme }) => theme.spacing.lg} 0;
  overflow: hidden;
`

const TitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin: 0;
`

const ViewAll = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`

const TrackOuter = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
  scroll-snap-type: x proximity;
  scrollbar-width: thin;
  padding-bottom: 2px;
`

const Track = styled.div`
  display: flex;
  gap: ${(p) => p.$gap}px;
  align-items: stretch;
  scroll-behavior: smooth;
  justify-content: ${({ $center }) => ($center ? 'center' : 'flex-start')};
  & > * {
    scroll-snap-align: start;
  }
`

const CardBase = `
  flex: 0 0 auto;
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  display: block;
  background: #fff;
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  transform: translateZ(0);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 16px 36px rgba(0,0,0,0.18);
  }
  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.35s ease;
    will-change: transform;
  }
  &:hover img { transform: scale(1.12); }
`

const Slide = styled(Link)`
  ${CardBase}
  width: ${(p) => p.$w}px;
  height: ${(p) => p.$h}px;
`

const SlideBox = styled.div`
  ${CardBase}
  width: ${(p) => p.$w}px;
  height: ${(p) => p.$h}px;
`

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${(props) => (props.$left ? 'left: 12px;' : 'right: 12px;')}
  background: rgba(255,255,255,0.95);
  border: none;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 3;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  @media (max-width: 640px) {
    display: none;
  }
`
// props: title, items, viewALL, viewAllLabel, altura, ancho y separacion
export default function HomeCarrusel({
  title,
  items,
  viewAllLink,
  viewAllLabel = 'Ver todos',
  itemWidth = 160,
  itemHeight = 240,
  itemGap = 10
}) {
  const outerRef = useRef(null) // contenedor visible
  const trackRef = useRef(null) // banda interna
  const [center, setCenter] = useState(false)
  // center, si cabe en el ancho bisible, centro los items
  useEffect(() => {
    const check = () => {
      // calculo si necesito el scroll y decido si centro o resize
      const outer = outerRef.current
      const track = trackRef.current
      if (!outer || !track) return
      setCenter(track.scrollWidth <= outer.clientWidth)
    }

    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [items, itemWidth, itemHeight, itemGap])

  // separo el contenedor un 90% del ancho visible der y izq
  const scrollBy = (dir) => {
    const outer = outerRef.current
    if (!outer) return
    const step = outer.clientWidth * 0.9
    outer.scrollBy({ left: dir * step, behavior: 'smooth' })
  }
  // flechas si mas de un item
  const showArrows = (items?.length || 0) > 1

  // renderizamos header con titulo y ver all
  //
  return (
    <Wrapper>
      <TitleBar>
        <Title>{title}</Title>
        {viewAllLink && <ViewAll to={viewAllLink}>{viewAllLabel}</ViewAll>}
      </TitleBar>

      {showArrows && (
        <>
          <NavButton $left onClick={() => scrollBy(-1)} aria-label='Anterior'>
            <FiChevronLeft size={22} />
          </NavButton>
          <NavButton onClick={() => scrollBy(1)} aria-label='Siguiente'>
            <FiChevronRight size={22} />
          </NavButton>
        </>
      )}
      {/* overflow hidden , track con flex, decide justify-content segun si es center o resize */}
      <TrackOuter ref={outerRef}>
        <Track ref={trackRef} $center={center} $gap={itemGap}>
          {items.map((item) => {
            const common = { $w: itemWidth, $h: itemHeight }
            return item.link ? (
              <Slide key={item.id} to={item.link} {...common}>
                {item.component}
              </Slide>
            ) : (
              <SlideBox key={item.id} {...common}>
                {item.component}
              </SlideBox>
            )
            // por cada item, saco el slide con link y slideBox de saver por si no hay link(siempre lo hay)
          })}
        </Track>
      </TrackOuter>
    </Wrapper>
  )
}
