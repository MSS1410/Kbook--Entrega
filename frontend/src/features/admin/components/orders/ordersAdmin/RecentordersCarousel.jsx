import React from 'react'
import styled from 'styled-components'
import { absUrl } from '../../../../../utils/absUrl'

// UI -___-  -> contenedor de la tarjeta que envuelve al carrp
const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii?.lg || '12px'};
  background: ${({ theme }) => theme.colors.cardBg};
  overflow: hidden;
`
const CardBody = styled.div`
  padding: 16px;
`

// carro horizontal de pedidos recientes
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
  min-width: 280px; // ← ancho mínimo para que sea scrolleable
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
  border-radius: 999px; // ← círculo
  object-fit: cover;
  background: #eee; // ← placeholder si falla la carga
`
const Cover = styled.img`
  width: 42px;
  height: 56px;
  border-radius: 8px; // ← mini portada con esquinas suaves
  object-fit: cover;
  background: #f1f1f1; // ← placeholder
`
const Meta = styled.div`
  font-size: 12px;
  color: #64748b; // ← texto secundario
`

// Compo Principal: recibe estado de carga, error y la lista recientes
export default function RecentOrdersCarousel({ loading, err, recent }) {
  return (
    <Card>
      <CardBody>
        {loading ? ( // 1 estado: cargando
          <div style={{ padding: 12 }}>Cargando…</div>
        ) : err ? ( // 2 estado: error recibido del padre
          <div style={{ padding: 12, color: '#b00020' }}>{err}</div>
        ) : !recent?.length ? ( // 3 estado: vacío
          <div style={{ padding: 12, color: '#64748b' }}>
            No hay pedidos recientes.
          </div>
        ) : (
          // 4 estado: datos listos
          <HScroll>
            {recent.map((o) => {
              //  Normalizzo user
              const U = o.user
              const userName =
                (typeof U === 'object' && (U?.name || U?.email)) || 'Usuario'
              const userAvatar =
                typeof U === 'object' && U?.avatar ? absUrl(U.avatar) : ''

              //  Primer libro del pedido para mostrar una portada
              const first = Array.isArray(o.items) ? o.items[0] : null
              const b =
                first && typeof first.book === 'object' ? first.book : null
              const title = b?.title || 'Artículo'
              const cover = b?.coverImage ? absUrl(b.coverImage) : ''
              const more = Math.max(0, (o.items?.length || 0) - 1)
              return (
                /* key estable por _id */
                <OrderMini key={o._id}>
                  {' '}
                  {/* header -->  user */}
                  <Row>
                    {userAvatar ? (
                      <Avatar src={userAvatar} alt={userName} /> // avatar real
                    ) : (
                      <Avatar as='div' /> // ← placeholder he de poner uno a nvl global
                    )}
                    <div style={{ fontWeight: 600 }}>{userName}</div>
                  </Row>
                  {/* body, primer art del pedido */}
                  <Row>
                    {cover ? ( // cover 1r libro
                      <Cover src={cover} alt={title} />
                    ) : (
                      <Cover as='div' /> // plholder emptycover
                    )}
                    <div>
                      <div style={{ fontWeight: 600, lineHeight: 1.2 }}>
                        {title}
                        {more > 0 && ` +${more} más`}
                      </div>
                      {/* fecha creacion */}
                      <Meta>{new Date(o.createdAt).toLocaleString()}</Meta>{' '}
                    </div>
                  </Row>
                  {/* id y total */}
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Meta>Pedido #{String(o._id).slice(-6).toUpperCase()}</Meta>{' '}
                    {/* id */}
                    <div style={{ fontWeight: 700 }}>
                      {(o.totalPrice || 0).toLocaleString(undefined, {
                        style: 'currency',
                        currency: 'EUR'
                      })}{' '}
                      {/* EUR TOTAL */}
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
