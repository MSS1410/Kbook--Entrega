// frontend/src/admin/pages/orders/OrdersCountChart.jsx
import React from 'react'
import styled from 'styled-components'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts'

const ChartBox = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.colors.radii?.lg || '12px'};
  background: ${({ theme }) => theme.colors.cardBg};
  height: 320px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`
const ChartHead = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`
const ChartBody = styled.div`
  flex: 1;
  min-height: 0;
`

export default function OrdersCountChart({ data }) {
  return (
    <ChartBox>
      <ChartHead>Pedidos / últimos 30 días</ChartHead>
      <ChartBody>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray='3 3' opacity={0.2} />
            <XAxis dataKey='day' tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey='count' />
          </BarChart>
        </ResponsiveContainer>
      </ChartBody>
    </ChartBox>
  )
}
