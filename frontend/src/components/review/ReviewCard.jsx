import React from 'react'
import styled from 'styled-components'
import { format } from 'date-fns'

const Card = styled.div`
  width: ${({ width }) => width};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border-radius: ${({ theme }) => theme.radii.sm};
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: #e0e0e0;
`

const Username = styled.span`
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.base};
`

const BookSection = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: start;
`

const CoverWrapper = styled.div`
  position: relative;
  width: 80px;
  height: 110px;
  border-radius: ${({ theme }) => theme.radii.sm};
  overflow: hidden;
  background: #f5f5f5;
`

const Cover = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`

const Info = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
`

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing.sm};
`

const BookTitle = styled.span`
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.md};
  inline-size: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Rating = styled.div`
  color: #f59e0b;
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.base};
  white-space: nowrap;
`

const Comment = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 4; /* máx. 4 líneas */
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: normal;
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
  const avatarUrl =
    review.user?.avatar ||
    review.avatar ||
    'https://via.placeholder.com/48?text=User'

  const coverUrl =
    review.book?.coverImage ||
    'https://via.placeholder.com/80x110?text=No+Cover'

  const bookTitle = review.book?.title || 'Título desconocido'
  const stars =
    '★'.repeat(review.rating || 0) + '☆'.repeat(5 - (review.rating || 0))

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
            <BookTitle title={bookTitle}>{bookTitle}</BookTitle>
            <Rating>{stars}</Rating>
          </TitleRow>

          <Comment>{review.comment || '(Sin comentario)'}</Comment>

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
