import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const Card = styled.article`
  display: flex;
  flex-direction: column;
  border: 1px solid #ececec;
  border-radius: 16px;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
`
const Thumb = styled.div`
  width: 100%;
  aspect-ratio: 3/4;
  background: #f3f3f3;
  overflow: hidden;

  & > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.25s ease;
  }

  ${Card}:hover & > img {
    transform: scale(1.03);
  }
`
const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 12px 14px;
  min-height: 180px;
  text-align: center;
`
const Title = styled(Link)`
  font-weight: 800;
  font-size: 1rem;
  color: #111;
  text-decoration: none;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.6em;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`
const Author = styled.div`
  color: #666;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-height: 1.2em;
`
const Footer = styled.div`
  margin-top: auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
`
const GridPrice = styled.div`
  font-weight: 900;
  font-size: 1.05rem;
`
const Btns = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
`
const Add = styled.button`
  padding: 8px 10px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border: none;
  font-weight: 500;
  font-size: 0.8rem;
  cursor: pointer;
`

const getAuthorName = (a) => (typeof a === 'string' ? a : a?.name || '')
// tarjeta de result en rejilla,
//Portada grande, titulo, autor, precio CTA Add cart
export default function SearchGridItem({ book, minPrice, onAdd }) {
  const cover = book.coverImage || book.cover || book.coverImageUrl || ''
  const authorName = getAuthorName(book.author)

  return (
    <Card>
      <Thumb>{cover ? <img src={cover} alt={book.title} /> : null}</Thumb>
      <Body>
        {/* titulo libro */}
        <Title to={`/books/${book._id}`}>{book.title}</Title>
        <Author>{authorName}</Author>
        <Footer>
          {/* precio */}
          <GridPrice>
            {minPrice != null ? `${minPrice.toFixed(2)} €` : ''}
          </GridPrice>
          <Btns>
            {/* buttons actions */}
            <Add onClick={onAdd} aria-label='Añadir al carrito'>
              Añadir al carrito
            </Add>
          </Btns>
        </Footer>
      </Body>
    </Card>
  )
}
