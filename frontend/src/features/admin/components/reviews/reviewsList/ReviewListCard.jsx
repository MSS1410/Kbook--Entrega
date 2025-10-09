// frontend/src/admin/pages/reviews/ReviewListCard.jsx
import React from 'react'
import styled from 'styled-components'
import Button from '../../Button.jsx'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { absUrl } from '../../../../../utils/absUrl.js'
import { AVATAR_PLACEHOLDER } from '../../../../../constants/media.js'

const Card = styled.article`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  padding: 14px;
  display: grid;
  gap: 12px;
  min-width: 0;
`
const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  min-width: 0;
`
const UserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`
const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  object-fit: cover;
  background: #eee;
  flex: 0 0 auto;
`
const UserName = styled.div`
  font-weight: 600;
  line-height: 1.15;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
const Meta = styled.div`
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 12px;
`
const Rating = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  flex: 0 0 auto;
`
const BookRow = styled.div`
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 10px;
  align-items: center;
  min-width: 0;
`
const Cover = styled.img`
  width: 44px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  background: #f1f1f1;
  flex: 0 0 auto;
`
const Title = styled.div`
  font-weight: 700;
  line-height: 1.2;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`
const Text = styled.p`
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: ${({ theme }) => theme.colors.onSurface};
`
const Actions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: space-between;
`
const LeftActions = styled.div`
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
`
const RightActions = styled.div`
  display: inline-flex;
  gap: 8px;
`

export default function ReviewListCard({ r, onDelete, deleting }) {
  const user = r.user && typeof r.user === 'object' ? r.user : null
  const book = r.book && typeof r.book === 'object' ? r.book : null
  const userId = user?._id || user?.id
  const bookId = book?._id || book?.id
  const userName = user?.name || 'Usuario'
  const avatar = user?.avatar || ''
  const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'
  const rating = typeof r.rating === 'number' ? r.rating : '—'
  const cover = book?.coverImage || ''
  const bookTitle = book?.title || 'Libro'

  return (
    <Card>
      <TopRow>
        <UserRow>
          <Avatar
            src={absUrl(avatar) || AVATAR_PLACEHOLDER}
            alt={userName}
            onError={(e) => {
              if (e.currentTarget.src !== AVATAR_PLACEHOLDER) {
                e.currentTarget.src = AVATAR_PLACEHOLDER
              }
            }}
          />
          <div style={{ minWidth: 0 }}>
            <UserName title={userName}>{userName}</UserName>
            <Meta>{dateStr}</Meta>
          </div>
        </UserRow>
        <Rating>★ {rating}</Rating>
      </TopRow>

      <BookRow>
        {cover ? (
          <Cover src={absUrl(cover)} alt={bookTitle} />
        ) : (
          <Cover as='div' />
        )}
        <Title title={bookTitle}>{bookTitle}</Title>
      </BookRow>

      {r.comment ? <Text>{r.comment}</Text> : null}

      <Actions>
        <LeftActions>
          {userId && (
            <Button as={Link} to={`/admin/users/${userId}`} $variant='ghost'>
              Ver usuario
            </Button>
          )}
          {bookId && (
            <Button as={Link} to={`/admin/books/${bookId}`} $variant='ghost'>
              Ver libro
            </Button>
          )}
        </LeftActions>

        <RightActions>
          <Button
            $variant='danger'
            onClick={() => onDelete(r)}
            disabled={deleting}
            title='Eliminar reseña'
          >
            <Trash2 size={16} />
            {deleting ? ' Eliminando…' : ' Eliminar'}
          </Button>
        </RightActions>
      </Actions>
    </Card>
  )
}
