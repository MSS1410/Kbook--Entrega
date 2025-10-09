// frontend/src/features/admin/components/home/RecentUsersSection.jsx
import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import Section from '../../components/Section.jsx'
import HScroll from '../../components/HScroll.jsx'
import UserCard from '../../components/cards/UserCard.jsx'

const Panel = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
`

const Divider = styled.hr`
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing.md} 0;
`

const GhostBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  text-decoration: none;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.accent};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg};
  &:hover {
    background: ${({ theme }) => theme.colors.mutedSurface};
  }
`

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
`

export default function RecentUsersSection({ users = [] }) {
  return (
    <Panel>
      <Section
        title='Últimos usuarios registrados'
        subtitle='Vea los nuevos integrantes de Kbook'
        action={<GhostBtn to='/admin/users'>Ver todos</GhostBtn>}
      />
      <Divider />
      {users?.length ? (
        <HScroll>
          {users.map((u) => (
            <UserCard key={u._id || u.email} u={u} />
          ))}
        </HScroll>
      ) : (
        <Card>
          <div style={{ padding: 16, fontSize: 14, color: '#64748b' }}>
            Sin usuarios recientes.
          </div>
        </Card>
      )}
    </Panel>
  )
}
