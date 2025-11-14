import React from 'react'
import styled from 'styled-components'

const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.onSurfaceVariant};
  align-items: center;
  flex-wrap: wrap;
`

const Cover = styled.img`
  width: 80px;
  height: 110px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.sm};
  flex-shrink: 0;
`

const Info = styled.div`
  flex: 1;
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`

const Details = styled.div`
  flex: 1;
  min-width: 200px;
`

const Title = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.md};
`

const Format = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`

const Quantity = styled.input`   
  width: 60px;
  padding: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme }) => theme.colors.onSurfaceVariant};
  border-radius: ${({ theme }) => theme.radii.sm};
`

const Price = styled.div`
  font-weight: bold;
  min-width: 100px;
`

const RemoveBtn = styled.button`
  background: none;
  border: none;
  color: red;
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`
// fila dentro del carrito aside
export default function CartItem({ item, onQuantityChange, onRemove }) {
  return (
    <Row>
      <Cover src={item.book.coverImage} alt={item.book.title} />
      <Info>
        <Details>
          <Title>{item.book.title}</Title>
          <Format>
            {item.label} — {item.format}
          </Format>
     
        </Details>
        <div>
          <div>
            Cantidad:{' '}
            <Quantity
              type='number'
              min={1}
              value={item.quantity}
              onChange={(e) => onQuantityChange(item, Number(e.target.value))}
            />
          </div>
        </div>
        <Price>{(item.price * item.quantity).toFixed(2)} €</Price>
      </Info>
      <RemoveBtn onClick={() => onRemove(item)}>Eliminar</RemoveBtn>
    </Row>
  )
}
