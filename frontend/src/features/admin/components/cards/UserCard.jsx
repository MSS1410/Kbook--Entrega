import React from 'react'
import styled from 'styled-components'
import Avatar from '../Avatar.jsx'
import { avatarSrc } from '../../../../constants/media.js'

const Card = styled.div`
  width: 256px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;
`
const Body = styled.div`
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: center;
`
const Name = styled.div`
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`
const Small = styled.div`
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

const fmtDate = (iso) => new Date(iso).toLocaleDateString()

export default function UserCard({ u }) {
  return (
    <Card>
      <Body>
        <Avatar
          src={avatarSrc(u?.avatar?.url || u?.avatar)}
          name={u?.name || u?.fullName || u?.email}
        />
        <div style={{ minWidth: 0 }}>
          <Name>{u?.name || u?.fullName || 'Usuario'}</Name>
          <Small>{u?.email}</Small>
          <Small>Alta: {fmtDate(u?.createdAt)}</Small>
        </div>
      </Body>
    </Card>
  )
}
