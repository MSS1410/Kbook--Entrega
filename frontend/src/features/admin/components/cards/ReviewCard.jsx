import React from 'react'
import styled from 'styled-components'
import Avatar from '../Avatar.jsx'
import { avatarSrc } from '../../../../constants/media.js'

const Card = styled.div`
  width: 320px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;
`
const Body = styled.div`
  padding: 16px;
`
const Header = styled.div`
  display: flex;
  gap: 8px;
  align-items: center; // avatar nombre/fecha
`

const Name = styled.div`
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; //nombres largos
`
const Small = styled.div`
  font-size: 12px;
  color: #64748b;
`
const Text = styled.div`
  margin-top: 8px;
  font-size: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 3; // clamped text a 3 lines
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const fmtDate = (iso) => new Date(iso).toLocaleDateString()

export default function ReviewCard({ r }) {
  return (
    <Card>
      <Body>
        <Header>
          <Avatar
            name={r?.user?.name || r?.user?.email || 'U'} // inicial como fall
            src={avatarSrc(r?.user?.avatar)} // resuelve url VALIDA
          />
          <div style={{ minWidth: 0 }}>
            {/* nombre visible */}
            <Name>{r?.user?.name || r?.user?.email}</Name>
            {/* fecha visible */}
            <Small>{fmtDate(r?.createdAt)}</Small>
          </div>
        </Header>

        {/* cuerpo de reseña */}
        <Text>{r?.comment || r?.text}</Text>

        {r?.book && (
          // libro asociated if epanded
          <Small style={{ marginTop: 6 }}>
            en <strong>{r?.book?.title}</strong>
          </Small>
        )}
      </Body>
    </Card>
  )
}
