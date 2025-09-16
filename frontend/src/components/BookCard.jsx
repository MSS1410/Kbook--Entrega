import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.sm};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
`

const Cover = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`

const Content = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  flex: 1;
`

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
`

const Author = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.onSurface};
  margin: 0;
`

export default function BookCard({ book }) {
  return (
    <Link to={`/books/${book._id}`}>
      <Card>
        {book.coverImage && <Cover src={book.coverImage} alt={book.title} />}
        <Content>
          <Title>{book.title}</Title>
          <Author>{book.author?.name}</Author>
        </Content>
      </Card>
    </Link>
  )
}
