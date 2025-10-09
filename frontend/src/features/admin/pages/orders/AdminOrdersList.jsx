// frontend/src/admin/pages/orders/AdminOrdersList.jsx
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useSearchParams } from 'react-router-dom'
import { listOrders } from '../../api/adminApi.js'
import OrdersListToolbar from '../../components/orders/ordersList/OrdersListToolbar.jsx'
import OrdersGrid from '../../components/orders/ordersList/OrdersGrid.jsx'
import OrdersPager from '../../components/orders/ordersList/OrdersPager.jsx'
import { absUrl } from '../../../../utils/absUrl'

const Wrap = styled.div`
  display: grid;
  gap: 16px;
`
const PER_PAGE = 15

export default function AdminOrdersList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(Number(searchParams.get('page') || 1))
  const [order, setOrder] = useState(
    (searchParams.get('order') || 'desc').toLowerCase()
  )
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // sync URL
  useEffect(() => {
    const sp = new URLSearchParams()
    sp.set('page', String(page))
    sp.set('order', order)
    setSearchParams(sp)
  }, [page, order, setSearchParams])

  // fetch
  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const res = await listOrders({ page, limit: PER_PAGE, order })
        const arr = Array.isArray(res?.orders)
          ? res.orders
          : Array.isArray(res)
          ? res
          : []
        setOrders(arr)
        setTotal(res?.total ?? arr.length)
      } finally {
        setLoading(false)
      }
    })()
  }, [page, order])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PER_PAGE)),
    [total]
  )

  return (
    <Wrap>
      <OrdersListToolbar
        order={order}
        onChangeOrder={(v) => {
          setOrder(v)
          setPage(1)
        }}
      />

      {loading ? (
        <div style={{ padding: 12 }}>Cargando…</div>
      ) : orders.length === 0 ? (
        <div style={{ padding: 12, color: '#64748b' }}>No hay pedidos.</div>
      ) : (
        <>
          <OrdersGrid orders={orders} />
          <OrdersPager
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </>
      )}
    </Wrap>
  )
}
