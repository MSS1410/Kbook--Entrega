import React from 'react'
import styled from 'styled-components'

const Card = styled.div`
  width: 288px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;
`
const Body = styled.div`
  padding: 16px;
`
// pedido izq, estado derecha
const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`
const Badge = styled.span`
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 9999px;
  background: #f1f5f9;
`
const Muted = styled.div`
  margin-top: 6px;
  font-size: 13px;
  color: #64748b;
`
const Total = styled.div`
  margin-top: 10px;
  font-size: 18px;
  font-weight: 700;
`

// fecha local corta
const fmtDate = (iso) => new Date(iso).toLocaleDateString()
const currency = (n) =>
  typeof n === 'number'
    ? n.toLocaleString(undefined, { style: 'currency', currency: 'EUR' })
    : n
// robustez si no llega numero

export default function OrderCard({ o }) {
  return (
    <Card>
      <Body>
        <Row>
          <div style={{ fontWeight: 600, fontSize: 14 }}>
            Pedido #{o?.code || o?._id?.slice(-6)}
          </div>
          {/* estado simple */}
          <Badge>{o?.status || 'pending'}</Badge>
        </Row>
        <Muted>
          {o?.user?.name || o?.user?.email || 'Cliente'} ·{' '}
          {fmtDate(o?.createdAt)}
        </Muted>
        {/* total formato EUR */}
        <Total>{currency(o?.total || o?.amount)}</Total>
        {/* cantidad de items */}
        <Muted>{o?.items?.length || 0} artículos</Muted>
      </Body>
    </Card>
  )
}
