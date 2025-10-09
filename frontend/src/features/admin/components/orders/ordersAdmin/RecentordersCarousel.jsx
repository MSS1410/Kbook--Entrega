// frontend/src/admin/components/orders/ordersAdmin/RecentordersCarousel.jsx
import React from 'react'
import styled from 'styled-components'
import { absUrl } from '../../../../../utils/absUrl' // 👈 4 niveles hasta /src

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii?.lg || '12px'};
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

export default function RecentOrdersCarousel({ loading, err, recent }) {
  return (
    <Card>
      <CardBody>
        {loading ? (
          <div style={{ padding: 12 }}>Cargando…</div>
        ) : err ? (
          <div style={{ padding: 12, color: '#b00020' }}>{err}</div>
        ) : !recent?.length ? (
          <div style={{ padding: 12, color: '#64748b' }}>
            No hay pedidos recientes.
          </div>
        ) : (
          <HScroll>
            {recent.map((o) => {
              const U = o.user
              const userName =
                (typeof U === 'object' && (U?.name || U?.email)) || 'Usuario'
              const userAvatar =
                typeof U === 'object' && U?.avatar ? absUrl(U.avatar) : ''

              const first = Array.isArray(o.items) ? o.items[0] : null
              const b =
                first && typeof first.book === 'object' ? first.book : null
              const title = b?.title || 'Artículo'
              const cover = b?.coverImage ? absUrl(b.coverImage) : ''
              const more = Math.max(0, (o.items?.length || 0) - 1)

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
                      <Meta>{new Date(o.createdAt).toLocaleString()}</Meta>
                    </div>
                  </Row>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Meta>Pedido #{String(o._id).slice(-6).toUpperCase()}</Meta>
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
  )
}
