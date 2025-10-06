// frontend/src/admin/pages/orders/AdminOrders.jsx
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import Button from '../../components/Button.jsx'
import { listOrders, fetchOrdersForLastDays } from '../../api/adminApi.js'
import { ArrowRight, ShoppingCart } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar
} from 'recharts'

/* ---------- UI ---------- */
const Wrap = styled.div`
  display: grid;
  gap: 24px;
`
const Section = styled.section`
  display: grid;
  gap: 12px;
`
const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  h3 {
    font-size: 20px;
  }
  small {
    color: ${({ theme }) => theme.colors.mutedText};
  }
`
const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  overflow: hidden;
`
const CardBody = styled.div`
  padding: 16px;
`
const HScroll = styled.div`
  display: flex;
  gap: 12px;
  overflow: auto;
  padding-bottom: 6px;
  scroll-snap-type: x proximity;
  & > * {
    scroll-snap-align: start;
  }
`
const OrderMini = styled.div`
  min-width: 280px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  background: #fff;
  padding: 12px;
  display: grid;
  gap: 8px;
`
const Row = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`
const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  object-fit: cover;
  background: #eee;
`
const Cover = styled.img`
  width: 42px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
  background: #f1f1f1;
`
const Meta = styled.div`
  font-size: 12px;
  color: #64748b;
`
const TwoCol = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
`
const ChartBox = styled(Card)`
  height: 320px;
  display: flex;
  flex-direction: column;
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

/* ---------- Helpers métricas ---------- */
function daysBackSeries(days = 30) {
  const out = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    out.push({ key, label: key.slice(5), count: 0, amount: 0 })
  }
  return out
}

export default function AdminOrders() {
  const [recent, setRecent] = useState([])
  const [metrics, setMetrics] = useState(daysBackSeries())
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        setErr(null)
        // 1) últimos pedidos (para carrusel)
        const r = await listOrders({ page: 1, limit: 15 })
        const last = Array.isArray(r?.orders)
          ? r.orders
          : Array.isArray(r)
          ? r
          : []
        setRecent(last)

        // 2) métrica 30 días (pedidos + ingresos) — cliente
        const last30 = await fetchOrdersForLastDays(30, 200)
        const base = daysBackSeries(30)
        const map = new Map(base.map((d) => [d.key, d]))
        for (const o of last30) {
          const k = new Date(o.createdAt).toISOString().slice(0, 10)
          const cell = map.get(k)
          if (cell) {
            cell.count += 1
            cell.amount += o.totalPrice || 0
          }
        }
        setMetrics(Array.from(map.values()))
      } catch (e) {
        console.error(e)
        setErr('No se pudieron cargar los pedidos.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const countData = useMemo(
    () => metrics.map((d) => ({ day: d.label, count: d.count })),
    [metrics]
  )
  const amountData = useMemo(
    () => metrics.map((d) => ({ day: d.label, amount: d.amount })),
    [metrics]
  )

  return (
    <>
      <Wrap>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShoppingCart size={22} />
          <h2>Pedidos</h2>
        </div>

        {/* Sección 1: Últimos pedidos (carrusel) */}
        <Section>
          <SectionHead>
            <div>
              <h3>Últimos pedidos</h3>
              <small>Resumen de actividad reciente</small>
            </div>
            <Button as={Link} to='/admin/orders/list'>
              Ver todos <ArrowRight size={16} />
            </Button>
          </SectionHead>

          <Card>
            <CardBody>
              {loading ? (
                <div style={{ padding: 12 }}>Cargando…</div>
              ) : err ? (
                <div style={{ padding: 12, color: '#b00020' }}>{err}</div>
              ) : recent.length === 0 ? (
                <div style={{ padding: 12, color: '#64748b' }}>
                  No hay pedidos recientes.
                </div>
              ) : (
                <HScroll>
                  {recent.map((o) => {
                    const U = o.user
                    const userName =
                      typeof U === 'object' ? U?.name || 'Usuario' : 'Usuario'
                    const userAvatar =
                      typeof U === 'object' ? U?.avatar || '' : ''
                    const first = (o.items && o.items[0]) || null
                    const title = first?.book?.title || 'Artículo'
                    const cover = first?.book?.coverImage || ''
                    const more = (o.items?.length || 0) - 1
                    return (
                      <OrderMini key={o._id}>
                        <Row>
                          {userAvatar ? (
                            <Avatar src={userAvatar} alt={userName} />
                          ) : (
                            <Avatar as='div' />
                          )}
                          <div style={{ fontWeight: 600 }}>{userName}</div>
                        </Row>
                        <Row>
                          {cover ? (
                            <Cover src={cover} alt={title} />
                          ) : (
                            <Cover as='div' />
                          )}
                          <div>
                            <div style={{ fontWeight: 600, lineHeight: 1.2 }}>
                              {title}
                              {more > 0 && ` +${more} más`}
                            </div>
                            <Meta>
                              {new Date(o.createdAt).toLocaleString()}
                            </Meta>
                          </div>
                        </Row>
                        <Row style={{ justifyContent: 'space-between' }}>
                          <Meta>
                            Pedido #{String(o._id).slice(-6).toUpperCase()}
                          </Meta>
                          <div style={{ fontWeight: 700 }}>
                            {(o.totalPrice || 0).toLocaleString(undefined, {
                              style: 'currency',
                              currency: 'EUR'
                            })}
                          </div>
                        </Row>
                      </OrderMini>
                    )
                  })}
                </HScroll>
              )}
            </CardBody>
          </Card>
        </Section>

        {/* Sección 2 y 3: Gráficas */}
        <TwoCol>
          <ChartBox>
            <ChartHead>Pedidos / últimos 30 días</ChartHead>
            <ChartBody>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={countData}
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

          <ChartBox>
            <ChartHead>Ingresos / últimos 30 días</ChartHead>
            <ChartBody>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart
                  data={amountData}
                  margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id='amt' x1='0' y1='0' x2='0' y2='1'>
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
        </TwoCol>
      </Wrap>
    </>
  )
}
