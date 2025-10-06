// frontend/src/components/ReviewCarrusel.jsx
import React, { useState, useEffect } from 'react'
import { useWindowSize } from '@react-hook/window-size'
import styled from 'styled-components'
import ReviewCard from '../review/ReviewCard'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const CarouselWrapper = styled.div`
  position: relative;
  overflow: hidden;
  margin: ${({ theme }) => theme.spacing.lg} 0;
`

const TitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
`

const ViewAll = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  margin-left: ${({ theme }) => theme.spacing.md};
  &:hover {
    text-decoration: underline;
  }
`

const Track = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  transition: transform 0.3s cubic-bezier(0.77, 0, 0.18, 1);
  will-change: transform;
`

const Slide = styled.div`
  flex: 0 0 ${({ perView }) => (perView === 1 ? '90%' : '35%')};
  display: flex;
  justify-content: center;
`

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  ${({ left }) => (left ? 'left: 8px;' : 'right: 8px;')}
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.3);
  border: none;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  z-index: 1;
`

export default function ReviewsCarrusel({
  reviews = [],
  title = 'Reseñas destacadas',
  viewAllLink = '/reviews'
}) {
  const [width] = useWindowSize()
  const perView = width < 576 ? 1 : 2
  const [idx, setIdx] = useState(0)

  // Log incoming reviews
  useEffect(() => {
    console.log('📦 ReviewsCarrusel received reviews:', reviews)
    if (Array.isArray(reviews)) {
      console.log(
        `📊 Count: ${reviews.length}, current index: ${idx}, perView: ${perView}`
      )
      console.log(
        '🆔 Review IDs:',
        reviews.map((r) => r._id || '[no-id]')
      )
    }
  }, [reviews, perView, idx])

  const handleNav = (dir) => {
    const max = Math.max(0, reviews.length - perView)
    const prev = idx
    const next = Math.min(Math.max(0, idx + dir), max)
    setIdx(next)
    console.debug(
      `🧭 navigate reviews: dir=${dir}, prevIndex=${prev}, newIndex=${next}, maxIndex=${max}`
    )
  }

  return (
    <CarouselWrapper>
      <TitleBar>
        <Title>{title}</Title>
        <ViewAll to={viewAllLink}>Ver todas</ViewAll>
      </TitleBar>
      <NavButton
        left
        onClick={() => handleNav(-1)}
        aria-label='Anterior reseña'
      >
        <FiChevronLeft />
      </NavButton>
      <Track
        style={{
          transform: `translateX(-${idx * (100 / perView)}%)`
        }}
      >
        {reviews.map((r) => (
          <Slide key={r._id} perView={perView}>
            <ReviewCard review={r} width='100%' />
          </Slide>
        ))}
      </Track>
      <NavButton onClick={() => handleNav(1)} aria-label='Siguiente reseña'>
        <FiChevronRight />
      </NavButton>
    </CarouselWrapper>
  )
}
