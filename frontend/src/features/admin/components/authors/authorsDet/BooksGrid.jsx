import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import Button from '../../Button'

const Block = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  padding: 16px;
  display: grid;
  gap: 10px;
`
const GridBooks = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  @media (min-width: 900px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`
const BookCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.cardBg};
`
const BookCover = styled.div`
  position: relative;
  width: 100%;
  background: #eee;
  &::before {
    content: '';
    display: block;
    padding-bottom: 133.333%;
  }
  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`
const BookBody = styled.div`
  padding: 10px;
  font-size: 14px;
  display: grid;
  gap: 6px;
`
const BookTitle = styled.div`
  font-weight: 600;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: calc(1.25em * 2);
`

export default function BooksGrid({ authorName, books }) {
  return (
    <Block>
      <strong>Libros de {authorName}</strong>
      {/* head contexto */}
      {books.length ? (
        <GridBooks>
          {books.map((b) => (
            <BookCard key={b._id}>
              <BookCover>
                {b.coverImage ? <img src={b.coverImage} alt={b.title} /> : null}
              </BookCover>
              <BookBody>
                <BookTitle>{b.title}</BookTitle>
                <Button
                  as={Link}
                  $variant='ghost'
                  to={`/admin/books/${b._id}`}
                  style={{ justifySelf: 'start' }}
                >
                  {/* acceso al detalle del libro */}
                  Ver libro
                </Button>
              </BookBody>
            </BookCard>
          ))}
        </GridBooks>
      ) : (
        <div style={{ color: '#64748b' }}>
          Este autor no tiene libros asociados.
        </div>
      )}
    </Block>
  )
}
