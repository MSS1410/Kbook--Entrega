import React from 'react'
import styled from 'styled-components'
import ReviewCard from '../../cards/ReviewCard'

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  padding: 16px;
`
const Strip = styled.div`
  display: flex;
  gap: 50px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  padding-bottom: 6px;
  max-width: 100%;
  min-width: 0;
`
const Item = styled.div`
  flex: 0 0 280px;
  min-width: 280px;
`

export default function ReviewsCarousel({ reviews }) {
  return (
    <Card>
      <strong>Reseñas ({reviews.length})</strong>
      {reviews.length ? (
        <Strip>
          {reviews.map((r) => (
            <Item key={r._id}>
              <ReviewCard r={r} />
            </Item>
          ))}
        </Strip>
      ) : (
        <div style={{ color: '#64748b' }}>Sin reseñas.</div>
      )}
    </Card>
  )
}
