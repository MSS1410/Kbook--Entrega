import React from 'react'
import styled from 'styled-components'
import { absUrl } from '../../../../../utils/absUrl'

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
const ItemsWrap = styled.div`
  display: grid;
  gap: 8px;
`
const Item = styled.div`
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

export default function OrderCard({ o }) {
  const Ux = o.user
  const userName =
    (typeof Ux === 'object' && (Ux?.name || Ux?.email)) || 'Usuario' // nombre fallback
  const userAvatar =
    // normaliza URL
    typeof Ux === 'object' && Ux?.avatar ? absUrl(Ux.avatar) : ''

  // items del pedido
  const items = Array.isArray(o.items) ? o.items : []

  return (
    <Card>
      <Top>
        <U>
          {userAvatar ? (
            <Avatar src={userAvatar} alt={userName} /> // avatar si hay
          ) : (
            <Avatar as='div' /> // plchldr
          )}
          <div style={{ fontWeight: 600 }}>{userName}</div>
        </U>
        <Meta>#{String(o._id).slice(-6).toUpperCase()}</Meta>{' '}
        {/* codigo cort del pedido para que sea facil de leer en la interface */}
      </Top>

      <ItemsWrap>
        {items.map((it, idx) => {
          const b = typeof it.book === 'object' ? it.book : null
          const title = b?.title || it?.label || 'Artículo' // ← título del ítem
          const cover = b?.coverImage ? absUrl(b.coverImage) : '' // ← portada si existe
          return (
            <Item key={o._id + '-' + idx}>
              {cover ? <Cover src={cover} alt={title} /> : <Cover as='div' />}
              <div>
                <div style={{ fontWeight: 600, lineHeight: 1.2 }}>{title}</div>
                <Meta>
                  {it.quantity} ×{' '}
                  {(it.price || 0).toLocaleString(undefined, {
                    style: 'currency',
                    currency: 'EUR'
                  })}
                </Meta>
              </div>
            </Item>
          )
        })}
      </ItemsWrap>

      <Footer>
        <Meta>Estado: {o.status || '—'}</Meta> {/* ← estado textual */}
        <div style={{ fontWeight: 700 }}>
          {(o.totalPrice || 0).toLocaleString(undefined, {
            style: 'currency',
            currency: 'EUR'
          })}{' '}
          {/* ← total en € */}
        </div>
      </Footer>
    </Card>
  )
}
