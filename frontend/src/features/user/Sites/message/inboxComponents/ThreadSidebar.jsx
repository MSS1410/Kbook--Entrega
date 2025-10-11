// components/ThreadSidebar.jsx
import React from 'react'
import styled from 'styled-components'
import { AVATAR_PLACEHOLDER } from '../../../../../constants/media'

const Wrap = styled.div`
  display: grid;
  gap: 12px;
`
const SearchRow = styled.div`
  display: flex;
  gap: 8px;
`
const Input = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
`
const PlusBtn = styled.button`
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.colors?.primary || '#8b5cf6'};
  background: ${({ theme }) => theme.colors?.primary || '#8b5cf6'};
  color: #fff;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
`
const List = styled.ul`
  display: grid;
  gap: 8px;
`
const Item = styled.li`
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fff;
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: 10px;
  align-items: center;
  cursor: pointer;
  &:hover {
    background: #fafaff;
  }
`
const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  object-fit: cover;
  background: #f1f1f6;
`
const Name = styled.div`
  font-weight: 700;
`
const Time = styled.small`
  color: #666;
`
// props: threads : array {id, user, lastAt} loading, error
// onOpenNew -> abre modal, onOpenThread(t), selecciona hilo

export default function ThreadSidebar({
  loading,
  error,
  threads,
  onOpenNew,
  onOpenThread
}) {
  return (
    <div>
      <SearchRow>
        {/* inout de busqueda disabled */}
        <Input placeholder='Buscar en tus chats…' disabled />
        <PlusBtn onClick={onOpenNew}>+</PlusBtn>
      </SearchRow>
      <Wrap style={{ marginTop: 12 }}>
        {loading && <p>Cargando…</p>}
        {error && <p>{error}</p>}
        {!loading && !error && (
          <List>
            {/* lista de hilos con avatar, nombre ultimo mensaje, hora del mensaje */}

            {threads.map((t) => (
              <Item key={t.id} onClick={() => onOpenThread(t)}>
                <Avatar
                  src={t.user?.avatar || AVATAR_PLACEHOLDER}
                  alt={t.user?.name}
                  onError={(e) => {
                    if (e.currentTarget.src !== AVATAR_PLACEHOLDER) {
                      e.currentTarget.src = AVATAR_PLACEHOLDER
                    }
                  }}
                />
                <div>
                  <Name>{t.user?.name || 'Usuario'}</Name>
                  <div style={{ color: '#666', fontSize: 13 }}>
                    Último mensaje
                  </div>
                </div>
                <Time>
                  {t.lastAt ? new Date(t.lastAt).toLocaleString() : ''}
                </Time>
              </Item>
            ))}
          </List>
        )}
      </Wrap>
    </div>
  )
}
