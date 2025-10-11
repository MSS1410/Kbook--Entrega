import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import FormatPriceSelector from './FormatPriceSelector'

const RowCard = styled.article`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid #ececec;
  border-radius: ${({ theme }) => theme.radii.md};
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  @media (max-width: 640px) {
    grid-template-columns: 90px 1fr;
  }
`
const ThumbWrap = styled.div`
  width: 120px;
  aspect-ratio: 3/4;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f3f3;

  @media (max-width: 640px) {
    width: 90px;
  }
`
const Thumb = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`
const RowInfo = styled.div`
  display: grid;
  grid-template-rows: auto auto auto auto;
  min-width: 0;
`
const TitleLink = styled(Link)`
  font-weight: 700;
  font-size: 1.05rem;
  color: #111;
  text-decoration: none;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`
const Meta = styled.div`
  color: #555;
  font-size: 0.9rem;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
`
const Badge = styled.span`
  background: #f6f6f6;
  border: 1px solid #eee;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 0.75rem;
  color: #444;
`
const Excerpt = styled.p`
  margin: 0 0 8px 0;
  color: #444;
  font-size: 0.95rem;
  line-height: 1.35;
  max-height: 3.9em;
  overflow: hidden;
`
const BottomRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
`
const BtnRow = styled.div`
  display: inline-flex;
  gap: 8px;
`
const AddBtn = styled.button`
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid #e6e6e8;
  background: #fff;
  color: #111;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: #f7f7fa;
  }
`
const Cta = styled(Link)`
  padding: 7px 10px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  text-decoration: none;
  font-weight: 500;
  font-size: 0.8rem;
  white-space: nowrap;
`

const getAuthorName = (a) => (typeof a === 'string' ? a : a?.name || '')
const excerpt = (s, n = 180) => {
  if (!s) return ''
  if (s.length <= n) return s
  const cut = s.slice(0, n)
  const space = cut.lastIndexOf(' ')
  return (space > 0 ? cut.slice(0, space) : cut) + '…'
}
// mostraremos listado de libro en vista lista
// seguimos dinamica como en grid, pero mosraremos una lista y no la rejilla
export default function CatalogListItem({
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
    <RowCard>
      <ThumbWrap>
        {cover ? <Thumb src={cover} alt={book.title} /> : null}
      </ThumbWrap>

      <RowInfo>
        <TitleLink to={`/books/${book._id}`}>{book.title}</TitleLink>
        <Meta>
          {authorName && <span>{authorName}</span>}
          {book.category && <Badge>{book.category}</Badge>}
        </Meta>

        <Excerpt>
          {book.synopsis && book.synopsis.slice ? excerpt(book.synopsis) : ''}
        </Excerpt>
        {/* mosramos un cachito, extracto de sinopsis con excertp */}
        <BottomRow>
          <FormatPriceSelector
            formats={formats}
            selectedType={selectedType}
            price={price}
            onChangeType={onChangeType}
          />
          <BtnRow>
            <AddBtn onClick={onAdd} aria-label='Añadir al carrito'>
              Añadir al carrito
            </AddBtn>
            <Cta to={`/books/${book._id}`}>Ver detalle</Cta>
          </BtnRow>
        </BottomRow>
      </RowInfo>
    </RowCard>
  )
}
