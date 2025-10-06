import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const Card = styled(Link)`
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 10px;
  min-width: 280px;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.cardBg};
  color: inherit;
  text-decoration: none;
`
const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  object-fit: cover;
  background: #eee;
`
const Name = styled.div`
  font-weight: 700;
`
const Subject = styled.div`
  color: ${({ theme }) => theme.colors.onSurface};
`
const DateSm = styled.div`
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 12px;
`

export default function MessageCard({ m }) {
  const u = m?.fromUser || {}
  const d = m?.createdAt ? new Date(m.createdAt) : null
  const when = d ? d.toLocaleString() : ''
  return (
    <Card to='/admin/contact' title='Abrir bandeja'>
      {u.avatar ? (
        <Avatar src={u.avatar} alt={u.name || ''} />
      ) : (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            background: '#e5e7eb'
          }}
        />
      )}
      <div>
        <Name>{u.name || 'Usuario'}</Name>
        <Subject>{m?.subject || '(Sin asunto)'}</Subject>
        <DateSm>{when}</DateSm>
      </div>
    </Card>
  )
}
