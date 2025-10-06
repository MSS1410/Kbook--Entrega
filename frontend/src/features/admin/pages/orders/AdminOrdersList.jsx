// frontend/src/admin/pages/orders/AdminOrdersList.jsx
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useSearchParams } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import { listOrders } from '../../api/adminApi.js'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const Wrap = styled.div`
  display: grid;
  gap: 16px;
`
const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  h2 {
    font-size: 20px;
  }
  small {
    color: ${({ theme }) => theme.colors.mutedText};
  }
`
const Controls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`
const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
  border-radius: 10px;
`
const Grid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(1, minmax(0, 1fr));
`
const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  overflow: hidden;
  padding: 12px;
  display: grid;
  gap: 10px;
`
const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`
const Meta = styled.div`
  font-size: 12px;
  color: #64748b;
`
const U = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`
const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  object-fit: cover;
  background: #eee;
`
const It = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`
const Cover = styled.img`
  width: 42px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
  background: #f1f1f1;
`
const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`
const Pager = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const PER_PAGE = 15

export default function AdminOrdersList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(Number(searchParams.get('page') || 1))
  const [order, setOrder] = useState(
    (searchParams.get('order') || 'desc').toLowerCase()
  ) // 'desc' | 'asc'

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

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  return (
    <>
      <Wrap>
        <Head>
          <div>
            <h2>Todos los pedidos</h2>
            <small>
              {order === 'desc'
                ? 'Más recientes primero'
                : 'Más antiguos primero'}
            </small>
          </div>
          <Controls>
            <Select
              value={order}
              onChange={(e) => {
                setOrder(e.target.value)
                setPage(1)
              }}
              aria-label='Ordenar por fecha'
              title='Ordenar por fecha'
            >
              <option value='desc'>Más recientes</option>
              <option value='asc'>Más antiguos</option>
            </Select>
          </Controls>
        </Head>

        {loading ? (
          <div style={{ padding: 12 }}>Cargando…</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: 12, color: '#64748b' }}>No hay pedidos.</div>
        ) : (
          <>
            <Grid>
              {orders.map((o) => {
                const user = o.user
                const userName =
                  typeof user === 'object' ? user?.name || 'Usuario' : 'Usuario'
                const userAvatar =
                  typeof user === 'object' ? user?.avatar || '' : ''
                const first = (o.items && o.items[0]) || null
                const title = first?.book?.title || 'Artículo'
                const cover = first?.book?.coverImage || ''
                const more = (o.items?.length || 0) - 1

                return (
                  <Card key={o._id}>
                    <Top>
                      <U>
                        {userAvatar ? (
                          <Avatar src={userAvatar} alt={userName} />
                        ) : (
                          <Avatar as='div' />
                        )}
                        <div style={{ fontWeight: 600 }}>{userName}</div>
                      </U>
                      <Meta>#{String(o._id).slice(-6).toUpperCase()}</Meta>
                    </Top>

                    <It>
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
                        <Meta>{new Date(o.createdAt).toLocaleString()}</Meta>
                      </div>
                    </It>

                    <Footer>
                      <Meta>Estado: {o.status || '—'}</Meta>
                      <div style={{ fontWeight: 700 }}>
                        {(o.totalPrice || 0).toLocaleString(undefined, {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </div>
                    </Footer>
                  </Card>
                )
              })}
            </Grid>

            <Pager>
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft size={16} /> Anterior
              </Button>
              <div>
                Página {page} de {totalPages}
              </div>
              <Button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Siguiente <ChevronRight size={16} />
              </Button>
            </Pager>
          </>
        )}
      </Wrap>
    </>
  )
}
