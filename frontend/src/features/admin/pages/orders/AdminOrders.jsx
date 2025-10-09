// frontend/src/admin/pages/orders/AdminOrders.jsx
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import { listOrders, fetchOrdersForLastDays } from '../../api/adminApi.js'
import { ArrowRight, ShoppingCart } from 'lucide-react'
import RecentOrdersCarousel from '../../components/orders/ordersAdmin/RecentordersCarousel.jsx'
import OrdersCountChart from '../../components/orders/ordersAdmin/OrdersCountChart.jsx'
import OrdersAmountChart from '../../components/orders/ordersAdmin/OrdersAmountChart.jsx'
import { absUrl } from '../../../../utils/absUrl'

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
const TwoCol = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
`

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
        const r = await listOrders({ page: 1, limit: 15 })
        const last = Array.isArray(r?.orders)
          ? r.orders
          : Array.isArray(r)
          ? r
          : []
        setRecent(last)

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
    <Wrap>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ShoppingCart size={22} />
        <h2>Pedidos</h2>
      </div>

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

        <RecentOrdersCarousel loading={loading} err={err} recent={recent} />
      </Section>

      <TwoCol>
        <OrdersCountChart data={countData} />
        <OrdersAmountChart data={amountData} />
      </TwoCol>
    </Wrap>
  )
}
