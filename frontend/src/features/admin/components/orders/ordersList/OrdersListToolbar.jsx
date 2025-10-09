// frontend/src/admin/pages/orders/OrdersListToolbar.jsx
import React from 'react'
import styled from 'styled-components'

const Head = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  h2 { font-size: 20px; } small { color: ${({ theme }) =>
    theme.colors.mutedText}
`
const Controls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`
const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
  border-radius: 10px;
`

export default function OrdersListToolbar({ order, onChangeOrder }) {
  return (
    <Head>
      <div>
        <h2>Todos los pedidos</h2>
        <small>
          {order === 'desc' ? 'Más recientes primero' : 'Más antiguos primero'}
        </small>
      </div>
      <Controls>
        <Select
          value={order}
          onChange={(e) => onChangeOrder(e.target.value)}
          aria-label='Ordenar por fecha'
          title='Ordenar por fecha'
        >
          <option value='desc'>Más recientes</option>
          <option value='asc'>Más antiguos</option>
        </Select>
      </Controls>
    </Head>
  )
}
