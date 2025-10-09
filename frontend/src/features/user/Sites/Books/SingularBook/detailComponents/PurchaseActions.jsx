// frontend/src/features/Books/SingularBook/components/PurchaseActions.jsx
import React from 'react'
import styled from 'styled-components'

const Group = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`
const Btn = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font-weight: 600;
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  @media (max-width: 576px) {
    flex: 1 1 100%;
  }
`

export default function PurchaseActions({
  selected,
  adding,
  buying,
  onAddToCart,
  onBuyNow
}) {
  return (
    <Group>
      <Btn
        disabled={!selected || adding}
        onClick={onAddToCart}
        aria-label='Añadir al carrito'
      >
        {adding ? 'Añadiendo…' : 'Añadir al carrito'}
      </Btn>

      <Btn
        disabled={!selected || buying}
        onClick={onBuyNow}
        aria-label='Comprar ahora'
      >
        {buying ? 'Redirigiendo…' : 'Comprar'}
      </Btn>
    </Group>
  )
}
