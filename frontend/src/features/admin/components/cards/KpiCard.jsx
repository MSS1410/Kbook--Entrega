import React from 'react'
import styled from 'styled-components'

const Card = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;
`
const Body = styled.div`
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`
const IconWrap = styled.div`
  border-radius: 16px;
  background: #f1f5f9;
  padding: 12px;
  display: inline-flex;
`
const Label = styled.div`
  font-size: 0.9rem;
  color: #64748b;
`
const Value = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
`

export default function Kpi({ label, value, icon }) {
  // componente minimal y reusable para metricas del dashboard
  return (
    <Card>
      <Body>
        {/* slot para cualquier icona */}
        <IconWrap>{icon}</IconWrap>
        <div>
          {/* qué mide */}
          <Label>{label}</Label>
          {/* cuánto vale ahora */}
          <Value>{value}</Value>
        </div>
      </Body>
    </Card>
  )
}

// KPI key performance indicator.
//indicador de renidimiento que asume metrica importante, ventas totales usuarios nuevos etc.
