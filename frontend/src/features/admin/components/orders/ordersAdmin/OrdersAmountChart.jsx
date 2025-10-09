// frontend/src/admin/pages/orders/OrdersAmountChart.jsx
import React from 'react'
import styled from 'styled-components'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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

export default function OrdersAmountChart({ data }) {
  return (
    <ChartBox>
      <ChartHead>Ingresos / últimos 30 días</ChartHead>
      <ChartBody>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
          >
            <defs>
              <linearGradient id='amt' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='currentColor' stopOpacity={0.35} />
                <stop
                  offset='95%'
                  stopColor='currentColor'
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' opacity={0.2} />
            <XAxis dataKey='day' tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v
              }
            />
            <Tooltip
              formatter={(v) =>
                v.toLocaleString(undefined, {
                  style: 'currency',
                  currency: 'EUR'
                })
              }
            />
            <Area
              type='monotone'
              dataKey='amount'
              stroke='currentColor'
              fill='url(#amt)'
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartBody>
    </ChartBox>
  )
}
