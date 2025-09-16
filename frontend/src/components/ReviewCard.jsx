// frontend/src/components/ReviewCard.jsx
import React from 'react'
import styled from 'styled-components'
import { format } from 'date-fns'

const Card = styled.div`
  width: ${({ width }) => width};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  border-radius: ${({ theme }) => theme.radii.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  min-height: 320px;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: #e0e0e0;
`

const Username = styled.span`
  font-weight: bold;
  font-size: ${({ theme }) => theme.fontSizes.base};
`

const BookSection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: flex-start;
  margin-top: ${({ theme }) => theme.spacing.sm};
`

const CoverWrapper = styled.div`
  position: relative;
  flex: 0 0 80px;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.radii.sm};
  overflow: hidden;
  min-width: 80px;
  height: 110px;
  background: #f5f5f5;
`

const Cover = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const Info = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing.sm};
`

const BookTitle = styled.span`
  font-weight: bold;
  font-size: ${({ theme }) => theme.fontSizes.md};
`

const Rating = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.fontSizes.base};
`

const Comment = styled.p`
  flex: 1;
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: 1.3;
  overflow: hidden;
`

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
`

const DateText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`

export default function ReviewCard({ review, width }) {
  // log para depurar estructura; puedes quitar después
  console.log('Render ReviewCard, review:', review)

  const avatarUrl =
    review.user?.avatar ||
    review.avatar ||
    'https://via.placeholder.com/48?text=User'
  const coverUrl =
    review.book?.coverImage ||
    'https://via.placeholder.com/80x110?text=No+Cover'
  const bookTitle = review.book?.title || 'Título desconocido'

  return (
    <Card width={width}>
      <Header>
        <Avatar src={avatarUrl} alt={review.user?.name || 'Usuario'} />
        <Username>{review.user?.name || 'Anónimo'}</Username>
      </Header>

      <BookSection>
        <CoverWrapper>
          <Cover src={coverUrl} alt={bookTitle} />
        </CoverWrapper>
        <Info>
          <TitleRow>
            <BookTitle>{bookTitle}</BookTitle>
            <Rating>⭐ {review.rating}</Rating>
          </TitleRow>
          <Comment>{review.comment}</Comment>
          <Footer>
            <DateText>
              {review.createdAt
                ? format(new Date(review.createdAt), 'dd MMM yyyy')
                : ''}
            </DateText>
          </Footer>
        </Info>
      </BookSection>
    </Card>
  )
}
