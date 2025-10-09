// components/ReviewCard.jsx
import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const Card = styled.article`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.cardBg};
  padding: 14px;
  display: grid;
  gap: 10px;
  min-width: 0;
`
const Row = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 10px;
  align-items: center;
`
const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  object-fit: cover;
  background: #f1f1f6;
`
const UserName = styled.div`
  font-weight: 700;
`
const BookRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
  img {
    width: 36px;
    height: 54px;
    border-radius: 6px;
    object-fit: cover;
    border: 1px solid ${({ theme }) => theme.colors.border};
    flex: 0 0 auto;
  }
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-weight: 600;
    min-width: 0;
  }
`
const Stars = styled.div`
  color: #f59e0b;
  letter-spacing: 1px;
  font-size: 16px;
`
const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 12px;
`

export default function ReviewCard({ r, getUrl, placeholder }) {
  return (
    <Card>
      <Row>
        <Avatar
          src={getUrl(r.user?.avatar) || placeholder}
          alt={r.user?.name || 'Usuario'}
          onError={(e) => {
            if (e.currentTarget.src !== placeholder) {
              e.currentTarget.src = placeholder
            }
          }}
        />
        <div>
          <UserName>{r.user?.name || 'Usuario'}</UserName>
          <Stars>
            {'★'.repeat(r.rating || 0)}
            {'☆'.repeat(5 - (r.rating || 0))}
          </Stars>
        </div>
      </Row>

      {r.book && (
        <BookRow>
          <img
            src={getUrl(r.book?.coverImage)}
            alt={r.book?.title}
            loading='lazy'
          />
          <Link to={`/books/${r.book?._id}`}>{r.book?.title}</Link>
        </BookRow>
      )}

      <div style={{ whiteSpace: 'pre-wrap' }}>
        {r.comment || r.description || '(Sin comentario)'}
      </div>

      <Footer>
        <span>
          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
        </span>
      </Footer>
    </Card>
  )
}
