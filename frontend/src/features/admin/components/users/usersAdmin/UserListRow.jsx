import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import Button from '../../Button.jsx'
import { Eye, Lock, Unlock } from 'lucide-react'
import Avatar from '../../Avatar.jsx'

const Row = styled.div`
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  padding: 8px;
  overflow: hidden;
`
const Thumb = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 8px;
  overflow: hidden;
  background: #eee;
  border: 1px solid ${({ theme }) => theme.colors.border};
  > div {
    width: 100%;
    height: 100%;
  } /* Avatar ocupa todo el thumb */
`
const RowContent = styled.div`
  min-width: 0;
  display: grid;
  gap: 6px;
`
const RowName = styled.div`
  font-weight: 600;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
const Badge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 12px;
  background: ${({ theme }) => theme.colors.mutedSurface};
  color: ${({ theme }) => theme.colors.accent};
`
const RowMeta = styled.div`
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 13px;
`
const RowActions = styled.div`
  display: flex;
  gap: 8px;
  justify-self: end;
  flex-wrap: wrap;
`

export default function UserListRow({ u, onToggleBlock }) {
  const avatarSrc = u?.avatar?.url || u?.avatar

  return (
    <Row>
      <Thumb>
        <Avatar
          fill
          square
          radius='8px'
          src={avatarSrc}
          name={u?.name || u?.email || 'Usuario'}
        />
      </Thumb>

      <RowContent>
        <RowName title={u.name}>
          {u.name}{' '}
          {u.role === 'admin' && (
            <span style={{ marginLeft: 8 }}>
              <Badge>admin</Badge>
            </span>
          )}
          {u.isBlocked && (
            <span style={{ marginLeft: 8 }}>
              <Badge>bloqueado</Badge>
            </span>
          )}
        </RowName>
        <RowMeta>
          Registrado:{' '}
          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
        </RowMeta>
      </RowContent>

      <RowActions>
        <Button as={Link} $variant='ghost' to={`/admin/users/${u._id}`}>
          <Eye size={16} /> Ver perfil
        </Button>
        <Button
          $variant={u.isBlocked ? 'primary' : 'danger'}
          onClick={() => onToggleBlock(u)}
        >
          {u.isBlocked ? <Unlock size={16} /> : <Lock size={16} />}
          {u.isBlocked ? ' Desbloquear' : ' Bloquear'}
        </Button>
      </RowActions>
    </Row>
  )
}
