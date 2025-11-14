// frontend/src/admin/pages/orders/OrdersGrid.jsx
import React from 'react'
import styled from 'styled-components'
import OrderCard from './OrderCard'

const Grid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(1, minmax(0, 1fr));
`

export default function OrdersGrid({ orders }) {
  return (
    <Grid>
      {orders.map((o) => (
        // cada pedido a su tarjet
        <OrderCard key={o._id} o={o} />
      ))}
    </Grid>
  )
}
