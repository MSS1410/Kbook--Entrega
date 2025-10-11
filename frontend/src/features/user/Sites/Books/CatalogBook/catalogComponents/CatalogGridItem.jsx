import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import FormatPriceSelector from './FormatPriceSelector'

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
  min-height: 200px;
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
const Btns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`
const Add = styled.button`
  padding: 5px 10px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border: none;
  font-weight: 500;
  font-size: 0.8rem;
  cursor: pointer;
`
const Detail = styled(Link)`
  padding: 5px 10px;
  border-radius: 10px;
  background: #f5f5f7;
  color: #111;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
`

const getAuthorName = (a) => (typeof a === 'string' ? a : a?.name || '')

// tarjeta del libro en rejilla
export default function CatalogGridItem({
  book,
  formats = [],
  selectedType,
  price,
  onChangeType,
  onAdd
}) {
  const cover = book.coverImage || book.cover || book.coverImageUrl || ''
  const authorName = getAuthorName(book.author)

  return (
    <Card>
      {/* mostramos portada, titulo, autor, selector de formato, precio y botones de detalle */}
      <Thumb>{cover ? <img src={cover} alt={book.title} /> : null}</Thumb>
      <Body>
        <Title to={`/books/${book._id}`}>{book.title}</Title>
        <Author>{authorName}</Author>

        <FormatPriceSelector
          formats={formats}
          selectedType={selectedType}
          price={price}
          onChangeType={onChangeType}
          alignCenter
          // centramos selector en layout
        />

        <Footer>
          {/* botones dentro del card de libro */}
          <Btns>
            <Add onClick={onAdd} aria-label='Añadir al carrito'>
              Añadir al carrito
            </Add>
            <Detail to={`/books/${book._id}`}>Detalle</Detail>
          </Btns>
        </Footer>
      </Body>
    </Card>
  )
}
