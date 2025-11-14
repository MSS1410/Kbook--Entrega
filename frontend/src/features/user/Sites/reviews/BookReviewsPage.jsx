// frontend/src/features/pages/reviews/BookReviewsPage.jsx
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import styled from 'styled-components'
import api from '../../../../api'
import { AVATAR_PLACEHOLDER } from '../../../../constants/media'

const Wrap = styled.div`
  max-width: 1100px;
  margin: 24px auto;
  padding: 0 16px;
  display: grid;
  gap: 16px;
`

const Header = styled.header`
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 16px;
  align-items: center;
  @media (max-width: 600px) {
    grid-template-columns: 72px 1fr;
  }
`

const Cover = styled.img`
  width: 96px;
  height: 128px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`

const H1 = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xl};
`

const BackLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 600;
  &:hover {
    text-decoration: underline;
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
`

const Card = styled.article`
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 12px;
  display: grid;
  gap: 8px;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: 10px;
  align-items: center;
`

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  object-fit: cover;
  background: #f1f1f6;
  border: 1px solid ${({ theme }) => theme.colors.border};
`

const Name = styled.div`
  font-weight: 800;
`

const Stars = styled.div`
  color: #f59e0b;
  letter-spacing: 2px;
  font-size: 14px;
`

const Body = styled.div`
  color: ${({ theme }) => theme.colors.onSurface};
  white-space: pre-wrap;
`

const Meta = styled.small`
  color: ${({ theme }) => theme.colors.mutedText};
`

export default function BookReviewsPage() {
  const { id } = useParams() // id del libro
  const [book, setBook] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const [{ data: b }, { data: rv }] = await Promise.all([
          api.get(`/api/books/${id}`), // fetch del libro
          api.get(`/api/reviews/book/${id}`) // fetch de reseñas
        ])
        setBook(b)
        setReviews(Array.isArray(rv) ? rv : [])
      } catch (e) {
        setReviews([])
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) {
    return (
      <Wrap>
        <p>Cargando reseñas…</p>
      </Wrap>
    )
  }

  return (
    <Wrap>
      <Header>

        <Cover src={book?.coverImage} alt={book?.title} />
        <div>
          <H1>Reseñas de “{book?.title || '—'}”</H1>
          <div style={{ marginTop: 4 }}>
            <BackLink to={`/books/${id}`}>Volver al libro</BackLink>
          </div>
        </div>
      </Header>

      {reviews.length === 0 ? (
        <p style={{ color: '#666' }}>Aún no hay reseñas para este libro.</p>
      ) : (
        
        <Grid>
          {reviews.map((r) => {
            const avatar = r.user?.avatar || r.avatar || AVATAR_PLACEHOLDER
            return (
              <Card key={r._id}>
                <Row>
                  <Avatar
                    src={avatar}
                    alt={r.user?.name || 'Usuario'}
                    onError={(e) => {
                      if (e.currentTarget.src !== AVATAR_PLACEHOLDER) {
                        e.currentTarget.src = AVATAR_PLACEHOLDER
                      }
                    }}
                  />
                  <Name>{r.user?.name || 'Anónimo'}</Name>
                  <Stars>
                    {'★'.repeat(r.rating || 0)}
                    {'☆'.repeat(5 - (r.rating || 0))}
                  </Stars>
                </Row>

                <Body>{r.comment || r.description || '(Sin comentario)'}</Body>
                <Meta>
                  {r.createdAt
                    ? new Date(r.createdAt).toLocaleDateString()
                    : ''}
                </Meta>
              </Card>
            )
          })}
        </Grid>
      )}
    </Wrap>
  )
}
