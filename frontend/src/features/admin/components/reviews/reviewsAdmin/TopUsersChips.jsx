import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { absUrl } from '../../../../../utils/absUrl'
import { AVATAR_PLACEHOLDER } from '../../../../../constants/media.js'

const Section = styled.section`
  display: grid;
  gap: 12px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
`
const Head = styled.div`
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
`
const ChipsRow = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 6px;
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 999px;
  }
`
const Chip = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
  border-radius: 999px;
  text-decoration: none;
  color: inherit;
  white-space: nowrap;
  &:hover {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  }
`
const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 999px;
  object-fit: cover;
  background: #eee;
`
const Badge = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`

export default function TopUsersChips({ topUsers, loading }) {
  return (
    <Section>
      <Head>
        <div>
          <h3 style={{ margin: 0 }}>Usuarios con más reseñas</h3>
          <small>Top actividad</small>
        </div>
      </Head>
      {loading ? (
        <div style={{ padding: '8px 0' }}>Cargando…</div>
      ) : topUsers.length === 0 ? (
        <div style={{ padding: '8px 0', color: '#64748b' }}>Sin datos.</div>
      ) : (
        <ChipsRow>
          {topUsers.map((u) => (
            <Chip
              key={u.id}
              to={`/admin/users/${u.id}?tab=reviews`}
              title={`${u.name} (${u.count})`}
            >
              <Avatar
                src={absUrl(u.avatar || '') || AVATAR_PLACEHOLDER}
                alt={u.name}
              />
              <span>{u.name}</span>
              {/* numerop reseñas del user */}
              <Badge>· {u.count}</Badge>
            </Chip>
          ))}
        </ChipsRow>
      )}
    </Section>
  )
}
