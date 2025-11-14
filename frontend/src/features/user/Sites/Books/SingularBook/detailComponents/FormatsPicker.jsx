import React from 'react'
import styled from 'styled-components'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`
const Card = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.onSurfaceVariant};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.08s;
  background: ${({ theme }) => theme.colors.cardBg};
  text-align: left;
  &:hover {
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
  }
  &:active {
    transform: translateY(1px);
  }
  &.active {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary};
  }
`
const Price = styled.p`
  margin: 0;
  font-weight: 700;
`
// grid fluido, card.active dibuja focus en el seleccionado. mostramos formatos
export default function FormatsPicker({ formats = [], selected, onSelect }) {
  return (
    <Grid>
      {formats.map((f) => (
        <Card
          key={f.type}
          type='button'
          onClick={() => onSelect?.(f)}
          className={selected?.type === f.type ? 'active' : ''}
          aria-label={`Seleccionar formato ${f.label}`}
          title={`Seleccionar ${f.label}`}
        >
          <span>{f.label}</span>
          <Price>{(f.price ?? 0).toFixed(2)} €</Price>
        </Card>
      ))}
    </Grid>
  )
}
