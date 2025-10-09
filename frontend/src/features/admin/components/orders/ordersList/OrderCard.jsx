// frontend/src/admin/pages/orders/OrderCard.jsx
import React from 'react'
import styled from 'styled-components'
import { absUrl } from '../../../../../utils/absUrl' // 👈 4 niveles desde /src/admin/pages/orders

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
    (typeof Ux === 'object' && (Ux?.name || Ux?.email)) || 'Usuario'
  const userAvatar =
    typeof Ux === 'object' && Ux?.avatar ? absUrl(Ux.avatar) : ''

  const items = Array.isArray(o.items) ? o.items : []

  return (
    <Card>
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

      <ItemsWrap>
        {items.map((it, idx) => {
          const b = typeof it.book === 'object' ? it.book : null
          const title = b?.title || it?.label || 'Artículo'
          const cover = b?.coverImage ? absUrl(b.coverImage) : ''
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
}
