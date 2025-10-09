// components/ReviewsSearchBox.jsx
import React from 'react'
import styled from 'styled-components'

const Wrap = styled.div`
  position: relative;
  display: grid;
  gap: 6px;
`
const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px;
`
const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
`
const ClearBtn = styled.button`
  padding: 8px 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.mutedText};
  cursor: pointer;
`
const Results = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin: 6px 0 0;
  max-height: 280px;
  overflow: auto;
  z-index: 5;
`
const Item = styled.li`
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 8px;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.mutedSurface};
  }
  img {
    width: 32px;
    height: 48px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
  .t {
    font-weight: 600;
  }
  .a {
    color: ${({ theme }) => theme.colors.mutedText};
    font-size: 0.9rem;
  }
`

export default function ReviewsSearchBox({
  containerRef,
  q,
  onChangeQ,
  results = [],
  onClear,
  onPick
}) {
  return (
    <Wrap ref={containerRef}>
      <Row>
        <Input
          type='search'
          placeholder='Buscar por título de libro…'
          value={q}
          onChange={(e) => onChangeQ(e.target.value)}
          aria-label='Buscar libro por título'
        />
        <ClearBtn onClick={onClear} disabled={!q}>
          Limpiar
        </ClearBtn>
      </Row>

      {!!results.length && (
        <Results>
          {results.map((b) => (
            <Item key={b._id} onClick={() => onPick(b)}>
              <img
                src={
                  b.coverImage || 'https://via.placeholder.com/64x96?text=Libro'
                }
                alt={b.title}
                loading='lazy'
              />
              <div>
                <div className='t'>{b.title}</div>
                <div className='a'>{b.author?.name || ''}</div>
              </div>
            </Item>
          ))}
        </Results>
      )}
    </Wrap>
  )
}
