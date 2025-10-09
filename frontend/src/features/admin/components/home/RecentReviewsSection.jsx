// frontend/src/features/admin/components/home/RecentReviewsSection.jsx
import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import Section from '../../components/Section.jsx'
import HScroll from '../../components/HScroll.jsx'
import ReviewCard from '../../components/cards/ReviewCard.jsx'

const Panel = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
`

const Divider = styled.hr`
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing.md} 0;
`

const GhostBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  text-decoration: none;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.accent};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg};
  &:hover {
    background: ${({ theme }) => theme.colors.mutedSurface};
  }
`

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
`

export default function RecentReviewsSection({ reviews = [] }) {
  return (
    <Panel>
      <Section
        title='Reseñas recientes'
        subtitle='Muestreo de las últimas reseñas'
        action={<GhostBtn to='/admin/reviews'>Ver todas</GhostBtn>}
      />
      <Divider />
      {reviews?.length ? (
        <HScroll>
          {reviews.map((r) => (
            <ReviewCard key={r._id} r={r} />
          ))}
        </HScroll>
      ) : (
        <Card>
          <div style={{ padding: 16, fontSize: 14, color: '#64748b' }}>
            No hay reseñas recientes.
          </div>
        </Card>
      )}
    </Panel>
  )
}
