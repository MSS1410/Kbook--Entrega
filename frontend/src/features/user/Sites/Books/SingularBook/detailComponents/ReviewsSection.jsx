// frontend/src/features/user/Sites/Books/SingularBook/components/ReviewsSection.jsx
import React from 'react'
import styled, { useTheme } from 'styled-components'
import { Link } from 'react-router-dom'
// Ajusta esta ruta si tu estructura difiere:
import HomeCarrusel from '../../../../../../components/carrouseles/HomeCarrusels'

const Card = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.cardBg};
  display: grid;
  gap: 6px;
`
const Stars = styled.div`
  font-size: 16px;
  letter-spacing: 2px;
  color: #f59e0b;
`
const SmallMeta = styled.small`
  color: ${({ theme }) => theme.colors.mutedText};
`
const Muted = styled.p`
  color: ${({ theme }) => theme.colors.mutedText};
  margin: 0.5rem 0 0;
`
const Btn = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary};
  background: transparent;
  cursor: pointer;
  font-weight: 600;
`

// Helper local (sin utils/)
const truncateWords = (str = '', n = 12) => {
  const w = String(str).trim().split(/\s+/).filter(Boolean)
  if (w.length <= n) return w.join(' ')
  return w.slice(0, n).join(' ') + '…'
}

export default function ReviewsSection({
  bookId,
  bookTitle,
  reviews = [],
  onOpenModal
}) {
  const theme = useTheme()

  if (!reviews.length) {
    return (
      <>
        <Muted>
          Aún no hay reseñas para <strong>{bookTitle}</strong>. ¡Sé el primero
          en dejar la tuya!
        </Muted>
        <div style={{ marginTop: 8 }}>
          <Btn onClick={onOpenModal}>Deja tu huella</Btn>{' '}
          {/* En el estado vacío, mantenemos el enlace original */}
          <Link to={`/reviews?book=${bookId}`}>Ver todas</Link>
        </div>
      </>
    )
  }

  return (
    <>
      <HomeCarrusel
        title='Opiniones de lectores'
        items={reviews.map((r) => ({
          id: r._id || `${r.user?.name}-${r.createdAt}`,
          component: (
            <Card>
              <Stars>
                {'★'.repeat(r.rating || 0)}
                {'☆'.repeat(5 - (r.rating || 0))}
              </Stars>
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {truncateWords(
                  r.comment || r.description || '(Sin comentario)',
                  12
                )}
              </div>
              <SmallMeta>
                {r.user?.name || 'Anónimo'} •{' '}
                {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
              </SmallMeta>
            </Card>
          )
        }))}
        viewAllLink={`/books/${bookId}/reviews`}
        itemWidth={260}
        itemHeight={160}
        itemGap={12}
        viewAllLabel='Ver más'
      />

      <div style={{ marginTop: theme.spacing.sm }}>
        <Btn onClick={onOpenModal}>Deja tu huella</Btn>{' '}
        <Link to={`/books/${bookId}/reviews`}>Ver más</Link>
      </div>
    </>
  )
}
