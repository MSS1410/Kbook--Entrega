// frontend/src/features/admin/pages/contact/ThreadView.jsx
import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { fmtDateTime, trimSubject } from './contactUtils'

const Thread = styled.div`
  padding: 12px;
  display: grid;
  gap: 10px;
`
const Bubble = styled.div`
  max-width: 80%;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  background: ${({ $me }) => ($me ? '#f5f3ff' : '#ecfdf5')};
  justify-self: ${({ $me }) => ($me ? 'end' : 'start')};
  white-space: pre-wrap;
  word-break: break-word;
`
const Sender = styled.div`
  font-weight: 800;
  color: ${({ $me }) => ($me ? '#8b5cf6' : '#10b981')};
  margin-bottom: 4px;
  text-align: ${({ $me }) => ($me ? 'right' : 'left')};
`
const Meta = styled.div`
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
  justify-self: ${({ $me }) => ($me ? 'end' : 'start')};
`

export default function ThreadView({ loading, selectedUserId, thread }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread])

  if (loading) return <div style={{ padding: 12 }}>Cargando conversación…</div>
  if (!selectedUserId)
    return (
      <div style={{ padding: 12, color: '#64748b' }}>
        Selecciona un mensaje o usa “Enviar mensaje”.
      </div>
    )
  if (thread.length === 0)
    return (
      <div style={{ padding: 12, color: '#64748b' }}>
        No hay mensajes aún con este usuario.
      </div>
    )

  return (
    <Thread>
      {thread.map((m, i) => {
        const key =
          m.id || m._id || (m.createdAt ? `${m.createdAt}-${i}` : `tmp-${i}`)
        return (
          <div key={key} style={{ display: 'grid', gap: 4 }}>
            <Bubble $me={m.me}>
              <Sender $me={m.me}>{m.me ? 'Tú' : m.fromName}</Sender>
              {m.subject ? (
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  {trimSubject(m.subject)}
                </div>
              ) : null}
              {m.body || <i>(Sin contenido)</i>}
            </Bubble>
            <Meta $me={m.me}>{fmtDateTime(m.createdAt)}</Meta>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </Thread>
  )
}
