// components/ChatPanel.jsx
import React from 'react'
import styled from 'styled-components'
import { AVATAR_PLACEHOLDER } from '../../../../../constants/media'

const Wrap = styled.div`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 16px;
  min-height: 60vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
`
const Header = styled.div`
  padding: 12px 14px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 10px;
`
const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  object-fit: cover;
  background: #f1f1f6;
`
const List = styled.div`
  padding: 14px;
  display: grid;
  gap: 12px;
  overflow: auto;
`

// Mensaje
const RowMsg = styled.div`
  display: grid;
  gap: 4px;
  justify-items: ${({ $me }) => ($me ? 'end' : 'start')};
  align-items: start;
`
const Bubble = styled.div`
  max-width: 80%;
  width: fit-content;
  overflow-wrap: anywhere;
  word-break: break-word;
  padding: 10px 12px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: ${({ $me }) => ($me ? '#f5f3ff' : '#ecfdf5')};
`
const Sender = styled.div`
  font-weight: 800;
  color: ${({ $me }) => ($me ? '#8b5cf6' : '#10b981')};
  text-align: ${({ $me }) => ($me ? 'right' : 'left')};
  margin-bottom: 4px;
`
const SentAt = styled.div`
  color: #777;
  font-size: 12px;
  margin-top: 2px;
  text-align: ${({ $me }) => ($me ? 'right' : 'left')};
`

const Composer = styled.form`
  display: flex;
  gap: 8px;
  padding: 10px;
  border-top: 1px solid #eee;
`
const Textarea = styled.textarea`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
  resize: vertical;
  min-height: 44px;
`
const SendBtn = styled.button`
  padding: 10px 14px;
  background: ${({ theme }) => theme.colors?.primary || '#8b5cf6'};
  color: #fff;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
`

export default function ChatPanel({
  active,
  messages,
  loadingMsgs,
  compose,
  onCompose,
  onSend
}) {
  return (
    <div>
      <Wrap>
        <Header>
          {active ? (
            <>
              <Avatar
                src={active.user?.avatar || AVATAR_PLACEHOLDER}
                alt={active.user?.name}
                onError={(e) => {
                  if (e.currentTarget.src !== AVATAR_PLACEHOLDER) {
                    e.currentTarget.src = AVATAR_PLACEHOLDER
                  }
                }}
              />
              <div style={{ fontWeight: 800 }}>{active.user?.name}</div>
            </>
          ) : (
            <div style={{ color: '#666' }}>Selecciona un chat</div>
          )}
        </Header>

        <List>
          {loadingMsgs && <p>Cargando conversación…</p>}
          {!loadingMsgs &&
            active &&
            messages.map((m) => {
              const fromId = m.from?._id || m.from?.id
              const me =
                String(fromId || '') ===
                String(active?.user?.currentUserId || '___no')
              // Nota: el padre identifica "me" al crear el mensaje y porque el receptor es admin;
              // aquí asumimos que los mensajes ya vienen con su "from" correcto.
              // Para evitar confusiones, simplemente mostramos "Tú" si el padre ya agregó así.
              const showMe = /^(tú|tu)$/i.test(m.from?.name || '') || me
              return (
                <RowMsg key={m._id} $me={showMe}>
                  <Bubble $me={showMe}>
                    <Sender $me={showMe}>
                      {showMe ? 'Tú' : m.from?.name || 'Usuario'}
                    </Sender>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {m.body || '(Sin contenido)'}
                    </div>
                    <SentAt $me={showMe}>
                      {m.createdAt
                        ? new Date(m.createdAt).toLocaleString()
                        : ''}
                    </SentAt>
                  </Bubble>
                </RowMsg>
              )
            })}
        </List>

        <Composer onSubmit={onSend}>
          <Textarea
            placeholder={
              active
                ? 'Escribe un mensaje…'
                : 'Selecciona un chat para escribir'
            }
            value={compose}
            onChange={(e) => onCompose(e.target.value)}
            disabled={!active}
          />
          <SendBtn disabled={!active || !compose.trim()}>Enviar</SendBtn>
        </Composer>
      </Wrap>
    </div>
  )
}
