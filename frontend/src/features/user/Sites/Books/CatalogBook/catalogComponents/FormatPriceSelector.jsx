import React from 'react'
import styled from 'styled-components'

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`
const Select = styled.select`
  appearance: none;
  padding: 6px 10px;
  border: 1px solid #e6e6e8;
  border-radius: 8px;
  background: #fff;
  color: #111;
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    background: #f7f7fa;
  }
`
const Price = styled.div`
  font-weight: 700;
  font-size: 1rem;
`

export default function FormatPriceSelector({
  formats = [],
  selectedType,
  price,
  onChangeType,
  alignCenter = false
}) {
  return (
    <Row style={alignCenter ? { justifyContent: 'center' } : undefined}>
      {formats.length > 0 && (
        <Select
          value={selectedType || ''}
          onChange={(e) => onChangeType?.(e.target.value)}
          aria-label='Elegir formato'
        >
          {formats.map((f) => (
            <option key={f.type} value={f.type}>
              {f.label || f.type}
            </option>
          ))}
        </Select>
      )}
      <Price>{price != null ? `${price.toFixed(2)} €` : ''}</Price>
    </Row>
  )
}
