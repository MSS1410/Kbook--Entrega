// frontend/src/features/admin/components/home/EconomySection.jsx
import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import Section from '../../components/Section.jsx'
import HScroll from '../../components/HScroll.jsx'
import OrderCard from '../../components/cards/OrderCard.jsx'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

const Panel = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
`

const Divider = styled.hr`
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing.md} 0;
`

const GhostBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  text-decoration: none;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.accent};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg};
  &:hover {
    background: ${({ theme }) => theme.colors.mutedSurface};
  }
`

const TwoCol = styled.div`
  display: grid;
  gap: 24px;
  @media (min-width: 992px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
`

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
`

const CardHeader = styled.div`
  padding: 16px;
  font-weight: 600;
  font-size: 1rem;
`
const CardBody = styled.div`
  height: 288px;
  padding: 0 8px 8px 8px;
`

const currency = (n) =>
  typeof n === 'number'
    ? n.toLocaleString(undefined, { style: 'currency', currency: 'EUR' })
    : n

export default function EconomySection({ orders = [], series = [] }) {
  return (
    <Panel>
      <Section
        title='Economía Kbook'
        subtitle='Últimos pedidos y ventas'
        action={<GhostBtn to='/admin/orders'>Ver todos</GhostBtn>}
      />
      <Divider />
      <TwoCol>
        <div>
          {orders?.length ? (
            <HScroll>
              {orders.map((o) => (
                <OrderCard key={o._id} o={o} />
              ))}
            </HScroll>
          ) : (
            <Card>
              <div style={{ padding: 16, fontSize: 14, color: '#64748b' }}>
                Sin pedidos recientes.
              </div>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>Ventas últimos 30 días</CardHeader>
          <CardBody>
            {Array.isArray(series) && series.length ? (
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart
                  data={series}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id='sales' x1='0' y1='0' x2='0' y2='1'>
                      <stop
                        offset='5%'
                        stopColor='currentColor'
                        stopOpacity={0.35}
                      />
                      <stop
                        offset='95%'
                        stopColor='currentColor'
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' opacity={0.2} />
                  <XAxis dataKey='date' tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v
                    }
                  />
                  <Tooltip
                    formatter={(v) => currency(v)}
                    labelFormatter={(l) => `Día ${l}`}
                  />
                  <Area
                    type='monotone'
                    dataKey='amount'
                    stroke='currentColor'
                    fill='url(#sales)'
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: '100%',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#64748b',
                  fontSize: 14
                }}
              >
                Sin datos de ventas.
              </div>
            )}
          </CardBody>
        </Card>
      </TwoCol>
    </Panel>
  )
}
