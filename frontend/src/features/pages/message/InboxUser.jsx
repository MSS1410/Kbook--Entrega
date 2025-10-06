// frontend/src/features/pages/messages/InboxUser.jsx
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'
import NewChatModal from '../../../components/modal/NewChatModal'
import {
  getThreads,
  getThreadMessages,
  getMyMessages,
  sendMessageToThread,
  startThread
} from '../../../api/messages'
import useAuth from '../../../hooks/useAuth'
import { AVATAR_PLACEHOLDER } from '../../../constants/media'

const Page = styled.div`
  max-width: 1100px;
  margin: 24px auto;
  padding: 0 16px;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 16px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`
const SidebarWrap = styled.div`
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
const ThreadList = styled.ul`
  display: grid;
  gap: 8px;
`
const ThreadItem = styled.li`
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

const ChatWrap = styled.div`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 16px;
  min-height: 60vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
`
const ChatHeader = styled.div`
  padding: 12px 14px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 10px;
`
const ChatList = styled.div`
  padding: 14px;
  display: grid;
  gap: 12px;
  overflow: auto;
`

// Burbujas alineadas y coloreadas
const RowMsg = styled.div`
  display: grid;
  gap: 4px;
  justify-items: ${({ $me }) => ($me ? 'end' : 'start')};
  align-items: start; /* evita que la burbuja se estire en vertical */
`
const Bubble = styled.div`
  max-width: 80%;
  width: fit-content;
  display: inline-block; /* tamaño en base al contenido */
  overflow-wrap: anywhere; /* evita desbordes con palabras largas */
  word-break: break-word;
  padding: 10px 12px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: ${({ $me }) => ($me ? '#f5f3ff' : '#ecfdf5')}; /* lila / verde */
`
const Sender = styled.div`
  font-weight: 800;
  color: ${({ $me }) => ($me ? '#8b5cf6' : '#10b981')}; /* lila / verde */
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

/* ===================== Helpers de normalización ===================== */

// Usuario normalizado (id, name, avatar)
function normalizeUser(u) {
  if (!u) return null
  const id = u._id || u.id || String(u)
  return {
    _id: id,
    id,
    name: u.name || 'Usuario',
    avatar: u.avatar || null,
    role: u.role || u?.role
  }
}

// Admin contraparte para agrupar threads en el fallback (funciona para mensajes
// iniciados por el usuario: usa toAdmin si no hay fromAdmin)
function pickAdminCounterparty(m) {
  return (
    m.fromAdmin ||
    m.toAdmin ||
    (m.to && (m.to.role === 'admin' || m.to.isAdmin) ? m.to : null) ||
    (m.from && (m.from.role === 'admin' || m.from.isAdmin) ? m.from : null) ||
    null
  )
}

// Devuelve SIEMPRE un mensaje con `from` poblado (user o admin)
function normalizeMessage(m) {
  const sender = m.from || m.fromUser || m.fromAdmin || m.sender || null

  return {
    _id: m._id || m.id,
    from: normalizeUser(sender),
    body: m.body || m.text || m.message || '',
    subject: m.subject || '',
    createdAt: m.createdAt || m.sentAt || new Date().toISOString()
  }
}

/* ===================== Componente ===================== */

export default function InboxUser() {
  const { threadId } = useParams()
  const { user } = useAuth()
  const myId = user?._id

  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [active, setActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)

  const [openNew, setOpenNew] = useState(false)
  const [compose, setCompose] = useState('')

  // 1) Cargar threads; fallback con inbox si aún no hay threads
  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        try {
          const { data } = await getThreads()
          const arr = Array.isArray(data?.threads) ? data.threads : []
          setThreads(arr)
        } catch {
          // Fallback: agrupar mensajes simples por admin (fromAdmin o toAdmin)
          const { data } = await getMyMessages({ limit: 200 })
          const items = Array.isArray(data?.items) ? data.items : []
          const map = new Map()
          for (const m of items) {
            const otherAdmin = pickAdminCounterparty(m)
            if (!otherAdmin?._id && !otherAdmin?.id) continue
            const key = String(otherAdmin._id || otherAdmin.id)
            const prev = map.get(key)
            const lastAt = Math.max(
              prev?.lastAt || 0,
              +new Date(m.createdAt || 0)
            )
            map.set(key, {
              id: key,
              user: normalizeUser(otherAdmin),
              lastAt
            })
          }
          setThreads([...map.values()].sort((a, b) => b.lastAt - a.lastAt))
        }
      } catch {
        setError('No pudimos cargar tu bandeja.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // 2) Cargar mensajes del thread activo (normalizando `from`)
  const loadThread = async (t) => {
    setActive(t)
    setMessages([])
    setLoadingMsgs(true)
    try {
      try {
        const { data } = await getThreadMessages(t.id)
        const arr = Array.isArray(data?.messages) ? data.messages : []
        setMessages(arr.map(normalizeMessage))
      } catch {
        // Fallback con inbox simple filtrando por admin (t.id)
        const { data } = await getMyMessages({ limit: 200 })
        const items = Array.isArray(data?.items) ? data.items : []
        const arr = items
          .filter((m) => {
            const otherAdmin = pickAdminCounterparty(m)
            const otherId = otherAdmin?._id || otherAdmin?.id
            return String(otherId || '') === String(t.id)
          })
          .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
          .map(normalizeMessage)
        setMessages(arr)
      }
    } finally {
      setLoadingMsgs(false)
    }
  }

  // Abrir thread por URL si llega :threadId
  useEffect(() => {
    if (!threadId || !threads.length) return
    const found = threads.find((t) => String(t.id) === String(threadId))
    if (found) loadThread(found)
  }, [threadId, threads])

  const openThread = (t) => loadThread(t)

  const onSend = async (e) => {
    e.preventDefault()
    if (!compose.trim() || !active) return
    try {
      await sendMessageToThread(active.id, compose.trim(), 'Respuesta')
      setMessages((prev) => [
        ...prev,
        normalizeMessage({
          _id: 'tmp-' + Date.now(),
          fromUser: { _id: myId, name: 'Tú', avatar: user?.avatar },
          body: compose.trim(),
          subject: 'Respuesta',
          createdAt: new Date().toISOString()
        })
      ])
      setCompose('')
    } catch {
      alert(
        'Para responder desde aquí, activa los endpoints de threads en el backend (/api/messages/*).'
      )
    }
  }

  // Confirmado desde el modal (usuario seleccionado)
  const handleStartChat = async (u) => {
    if (!u?._id) return
    try {
      const { data } = await startThread(u._id, '', '')
      const t = data?.thread || {
        id: u._id,
        user: normalizeUser(u),
        lastAt: Date.now()
      }
      setThreads((prev) => [
        t,
        ...prev.filter((x) => String(x.id) !== String(t.id))
      ])
      setOpenNew(false)
      loadThread(t)
    } catch {
      alert('Crear chat nuevo requiere /api/messages/threads en backend.')
    }
  }

  return (
    <Page>
      {/* Aside izquierdo */}
      <div>
        <SearchRow>
          <Input placeholder='Buscar en tus chats…' disabled />
          <PlusBtn onClick={() => setOpenNew(true)}>+</PlusBtn>
        </SearchRow>

        <SidebarWrap style={{ marginTop: 12 }}>
          {loading && <p>Cargando…</p>}
          {error && <p>{error}</p>}
          {!loading && !error && (
            <ThreadList>
              {threads.map((t) => (
                <ThreadItem key={t.id} onClick={() => openThread(t)}>
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
                </ThreadItem>
              ))}
            </ThreadList>
          )}
        </SidebarWrap>
      </div>

      {/* Panel de conversación */}
      <div>
        <ChatWrap>
          <ChatHeader>
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
          </ChatHeader>

          <ChatList>
            {loadingMsgs && <p>Cargando conversación…</p>}
            {!loadingMsgs &&
              active &&
              messages.map((m) => {
                const fromId = m.from?._id || m.from?.id
                const me = String(fromId || '') === String(myId || '')
                return (
                  <RowMsg key={m._id} $me={me}>
                    <Bubble $me={me}>
                      <Sender $me={me}>
                        {me ? 'Tú' : m.from?.name || 'Usuario'}
                      </Sender>
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {m.body || '(Sin contenido)'}
                      </div>
                      <SentAt $me={me}>
                        {m.createdAt
                          ? new Date(m.createdAt).toLocaleString()
                          : ''}
                      </SentAt>
                    </Bubble>
                  </RowMsg>
                )
              })}
          </ChatList>

          <Composer onSubmit={onSend}>
            <Textarea
              placeholder={
                active
                  ? 'Escribe un mensaje…'
                  : 'Selecciona un chat para escribir'
              }
              value={compose}
              onChange={(e) => setCompose(e.target.value)}
              disabled={!active}
            />
            <SendBtn disabled={!active || !compose.trim()}>Enviar</SendBtn>
          </Composer>
        </ChatWrap>
      </div>

      {/* Modal externo: Nuevo chat */}
      <NewChatModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        onConfirm={handleStartChat}
      />
    </Page>
  )
}
