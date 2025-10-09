import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import Button from '../../Button.jsx'
import { Eye, Lock, Unlock } from 'lucide-react'
import Avatar from '../../Avatar.jsx'

const Card = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  overflow: hidden;
`

const AvatarWrap = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #eee;
  flex: 0 0 auto;

  /* cuadrado 1:1 */
  &::before {
    content: '';
    display: block;
    padding-bottom: 100%;
  }

  /* El Avatar ocupa todo el contenedor */
  > div {
    position: absolute;
    inset: 0;
  }
`

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  flex: 1;
`

const Name = styled.h3`
  font-size: 15px;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: calc(1.25em * 2);
`

const Badge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 12px;
  background: ${({ theme }) => theme.colors.mutedSurface};
  color: ${({ theme }) => theme.colors.accent};
`

const Actions = styled.div`
  margin-top: auto;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  a,
  button {
    font-size: 13px;
  }
`

export default function UserGridCard({ u, onToggleBlock }) {
  const avatarSrc = u?.avatar?.url || u?.avatar

  return (
    <Card>
      <AvatarWrap>
        {/* fill + square => ocupa todo el “header” cuadrado */}
        <Avatar
          fill
          square
          src={avatarSrc}
          name={u?.name || u?.email || 'Usuario'}
        />
      </AvatarWrap>

      <CardBody>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Name title={u.name}>{u.name}</Name>
          {u.role === 'admin' && <Badge>admin</Badge>}
          {u.isBlocked && <Badge>bloqueado</Badge>}
        </div>

        <Actions>
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
        </Actions>
      </CardBody>
    </Card>
  )
}
