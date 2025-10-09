// frontend/src/features/admin/pages/contact/InboxList.jsx
import React from 'react'
import styled from 'styled-components'
import { AVATAR_PLACEHOLDER } from '../../../../constants/media'
import { fmtDateTime, trimSubject } from './contactUtils'

const List = styled.div`
  display: grid;
  gap: 8px;
  padding: 10px;
`
const Item = styled.div`
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.primary : theme.colors.border};
  background: #fff;
  border-radius: 12px;
  padding: 10px;
  display: grid;
  gap: 6px;
  cursor: pointer;
  &:hover {
    box-shadow: 0 1px 10px rgba(0, 0, 0, 0.06);
  }
  opacity: ${({ $unread }) => ($unread ? 0.85 : 1)};
`
const Row = styled.div`
  display: grid;
  grid-template-columns: 42px 1fr auto;
  gap: 10px;
  align-items: center;
  min-width: 0;
`
const Avatar = styled.img`
  width: 42px;
  height: 42px;
  border-radius: 999px;
  object-fit: cover;
  background: #eee;
  border: 1px solid ${({ theme }) => theme.colors.border};
`
const Title = styled.div`
  font-weight: 800;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const Muted = styled.div`
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const Snippet = styled.div`
  font-size: 14px;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const Right = styled.div`
  display: grid;
  justify-items: end;
  gap: 6px;
`
const TrashBtn = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
  color: #ef4444;
  padding: 4px 8px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  &:hover {
    background: #fff1f2;
  }
`

const Pager = styled.div`
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: center;
  padding: 10px;
`
const PageBtn = styled.button`
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : '#fff'};
  color: ${({ $active }) => ($active ? '#fff' : '#111827')};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`

export default function InboxList({
  inbox,
  loading,
  selectedUserId,
  page,
  totalPages,
  onChangePage,
  onSelect,
  onDeleteThread
}) {
  if (loading) return <div style={{ padding: 12 }}>Cargando…</div>
  if (!inbox.length)
    return (
      <div style={{ padding: 12, color: '#64748b' }}>Aún no hay mensajes.</div>
    )

  return (
    <>
      <List>
        {inbox.map((it, i) => (
          <Item
            key={it.userId || `user-${i}`}
            $active={String(selectedUserId) === String(it.userId)}
            $unread={!!it.unread}
            onClick={() => onSelect(it)}
            title={trimSubject(it.subject)}
          >
            <Row>
              <Avatar
                src={it.userAvatar || AVATAR_PLACEHOLDER}
                alt={it.userName}
                onError={(e) => {
                  if (e.currentTarget.src !== AVATAR_PLACEHOLDER)
                    e.currentTarget.src = AVATAR_PLACEHOLDER
                }}
              />
              <div style={{ minWidth: 0 }}>
                <Title>{it.userName}</Title>
                <Snippet>{trimSubject(it.subject) || '(Sin asunto)'}</Snippet>
                <Muted style={{ whiteSpace: 'normal' }}>{it.snippet}</Muted>
              </div>
              <Right onClick={(e) => e.stopPropagation()}>
                <Muted>{fmtDateTime(it.createdAt)}</Muted>
                <TrashBtn
                  onClick={() => onDeleteThread(it.userId, it.userName)}
                >
                  🗑 Eliminar
                </TrashBtn>
              </Right>
            </Row>
          </Item>
        ))}
      </List>

      <Pager>
        <PageBtn onClick={() => onChangePage(page - 1)} disabled={page <= 1}>
          ‹ Anterior
        </PageBtn>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <PageBtn key={n} $active={n === page} onClick={() => onChangePage(n)}>
            {n}
          </PageBtn>
        ))}
        <PageBtn
          onClick={() => onChangePage(page + 1)}
          disabled={page >= totalPages}
        >
          Siguiente ›
        </PageBtn>
      </Pager>
    </>
  )
}
