import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Users as UsersIcon,
  ShoppingCart,
  BarChart2,
  BookOpen
} from 'lucide-react'

// ❌ OJO: ya no importamos AdminLayout aquí
// import AdminLayout from '../layout/AdminLayout.jsx'

import Section from '../components/Section.jsx'
import HScroll from '../components/HScroll.jsx'
import Kpi from '../components/cards/KpiCard.jsx'
import UserCard from '../components/cards/UserCard.jsx'
import OrderCard from '../components/cards/OrderCard.jsx'
import ReviewCard from '../components/cards/ReviewCard.jsx'
import MessageCard from '../components/cards/MessageCard.jsx'
import { fetchAdminHome } from '../api/adminApi.js'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

const PageWrap = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xl};
`
const SectionGroup = styled.div`
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
const Grid = styled.div`
  display: grid;
  gap: 16px;
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
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

const currency = (n) =>
  typeof n === 'number'
    ? n.toLocaleString(undefined, { style: 'currency', currency: 'EUR' })
    : n

export default function AdminHome() {
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [data, setData] = useState({
    users: [],
    orders: [],
    metrics: { series: [], totalAmount: 0, totalOrders: 0 },
    inbox: [],
    reviews: []
  })

  useEffect(() => {
    ;(async () => {
      try {
        const d = await fetchAdminHome()
        setData(d)
      } catch (e) {
        setErr(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const kpis = useMemo(() => {
    const totalUsers = data?.metrics?.usersTotal ?? 0
    const totalOrders = data?.metrics?.totalOrders ?? 0
    const totalSales = data?.metrics?.totalAmount ?? 0
    const avgTicket =
      totalOrders > 0 ? Number(totalSales / totalOrders).toFixed(2) : 0

    return [
      {
        label: 'Usuarios (total)',
        value: totalUsers,
        icon: <UsersIcon size={20} />
      },
      {
        label: 'Pedidos (total)',
        value: totalOrders,
        icon: <ShoppingCart size={20} />
      },
      {
        label: 'Ventas (total)',
        value: currency(totalSales),
        icon: <BarChart2 size={20} />
      },
      {
        label: 'Ticket medio',
        value: currency(Number(avgTicket)),
        icon: <BookOpen size={20} />
      }
    ]
  }, [data])

  if (loading) {
    return (
      <PageWrap>
        <Grid>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                height: 96,
                borderRadius: 16,
                background: '#f1f5f9',
                animation: 'pulse 1.2s infinite'
              }}
            />
          ))}
        </Grid>
        <TwoCol>
          <div
            style={{
              height: 320,
              borderRadius: 16,
              background: '#f1f5f9',
              animation: 'pulse 1.2s infinite'
            }}
          />
          <div
            style={{
              height: 320,
              borderRadius: 16,
              background: '#f1f5f9',
              animation: 'pulse 1.2s infinite'
            }}
          />
        </TwoCol>
      </PageWrap>
    )
  }

  if (err) {
    return (
      <Card>
        <CardHeader>Ha ocurrido un error</CardHeader>
        <div style={{ padding: 16, color: '#b91c1c', fontSize: 14 }}>
          {String(err)}
        </div>
      </Card>
    )
  }

  return (
    <PageWrap>
      {/* KPIs */}
      <SectionGroup>
        <Section
          title='Actividad Reciente'
          subtitle='Resumen de los ultimos eventos'
        />
        <Grid>
          {kpis.map((k) => (
            <Kpi key={k.label} {...k} />
          ))}
        </Grid>
      </SectionGroup>

      {/* Usuarios recientes */}
      <SectionGroup>
        <Section
          title='Últimos usuarios registrados'
          subtitle='Vea los nuevos integrantes de Kbook'
          action={
            <GhostBtn to='/admin/users'>
              Ver todos <ArrowRight size={16} />
            </GhostBtn>
          }
        />
        <Divider />
        {data.users?.length ? (
          <HScroll>
            {data.users.map((u) => (
              <UserCard key={u._id || u.email} u={u} />
            ))}
          </HScroll>
        ) : (
          <Card>
            <div style={{ padding: 16, fontSize: 14, color: '#64748b' }}>
              Sin usuarios recientes.
            </div>
          </Card>
        )}
      </SectionGroup>

      {/* Pedidos + gráfico */}
      <SectionGroup>
        <Section
          title='Economia Kbook'
          subtitle='Últimos pedidos y ventas'
          action={
            <GhostBtn to='/admin/orders'>
              Ver todos <ArrowRight size={16} />
            </GhostBtn>
          }
        />
        <Divider />
        <TwoCol>
          <div>
            {data.orders?.length ? (
              <HScroll>
                {data.orders.map((o) => (
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
              {Array.isArray(data.metrics?.series) &&
              data.metrics.series.length ? (
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart
                    data={data.metrics.series}
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
      </SectionGroup>

      {/* Bandeja de entrada */}
      {/* <SectionGroup>
        <Section
          title='Bandeja de entrada'
          subtitle='Mensajes internos de usuarios'
          action={
            <GhostBtn to='/admin/contact'>
              Ver bandeja <ArrowRight size={16} />
            </GhostBtn>
          }
        />
        <Divider />
        {data.inbox?.length ? (
          <HScroll>
            {data.inbox.map((m) => (
              <MessageCard key={m._id} m={m} />
            ))}
          </HScroll>
        ) : (
          <Card>
            <div style={{ padding: 16, fontSize: 14, color: '#64748b' }}>
              No hay mensajes nuevos.
            </div>
          </Card>
        )}
      </SectionGroup> */}

      {/* Reseñas */}
      <SectionGroup>
        <Section
          title='Reseñas recientes'
          subtitle='Muestreo de las últimas reseñas'
          action={
            <GhostBtn to='/admin/reviews'>
              Ver todas <ArrowRight size={16} />
            </GhostBtn>
          }
        />
        <Divider />
        {data.reviews?.length ? (
          <HScroll>
            {data.reviews.map((r) => (
              <ReviewCard key={r._id} r={r} />
            ))}
          </HScroll>
        ) : (
          <Card>
            <div style={{ padding: 16, fontSize: 14, color: '#64748b' }}>
              No hay reseñas recientes.
            </div>
          </Card>
        )}
      </SectionGroup>
    </PageWrap>
  )
}
