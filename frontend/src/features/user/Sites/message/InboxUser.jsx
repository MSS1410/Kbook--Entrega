// InboxUser.jsx
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'
import NewChatModal from '../../../../components/modal/NewChatModal'
import {
  getThreads,
  getThreadMessages,
  getMyMessages,
  sendMessageToThread,
  startThread
} from '../../../../api/messages'
import useAuth from '../../../../hooks/useAuth'

// Presentacionales
import ThreadSidebar from './inboxComponents/ThreadSidebar'
import ChatPanel from './inboxComponents/ChatPanel'

/* ===== Layout contenedor ===== */
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

// Admin contraparte para agrupar threads en el fallback
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
          // Fallback: agrupar mensajes simples por admin
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

  // 2) Cargar mensajes del thread activo
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
        // Fallback filtrando por admin (t.id)
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
        user: { _id: u._id, id: u._id, name: u.name, avatar: u.avatar },
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
      {/* Aside izquierdo (presentacional) */}
      <ThreadSidebar
        loading={loading}
        error={error}
        threads={threads}
        onOpenNew={() => setOpenNew(true)}
        onOpenThread={loadThread}
      />

      {/* Panel de conversación (presentacional) */}
      <ChatPanel
        active={active}
        messages={messages}
        loadingMsgs={loadingMsgs}
        compose={compose}
        onCompose={setCompose}
        onSend={onSend}
      />

      {/* Modal: Nuevo chat */}
      <NewChatModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        onConfirm={handleStartChat}
      />
    </Page>
  )
}
