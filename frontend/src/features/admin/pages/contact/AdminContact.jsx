// frontend/src/features/admin/pages/contact/AdminContact.jsx
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import Button from '../../components/Button.jsx'
import Modal from '../../components/Modal.jsx' // (sigue disponible si lo usas en otros lugares)
import {
  listAdminInbox,
  getAdminThreadWithUser,
  adminSendMessageToUser,
  listUsersAdmin,
  markAllFromUserRead,
  deleteAdminThread
} from '../../api/adminApi.js'
import InboxList from '../../components/contact/InboxList.jsx'
import ThreadView from '../../components/contact/ThreadView.jsx'
import Composer from '../../components/contact/Composer.jsx'
import NewMessageModal from '../../components/contact/NewMessageModal.jsx'
import {
  compactByUser,
  trimSubject
} from '../../components/contact/contactUtils.js'
import { AVATAR_PLACEHOLDER } from '../../../../constants/media'

const Wrap = styled.div`
  display: grid;
  gap: 16px;
`
const Head = styled.div`
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  h2 {
    margin: 0;
    font-size: 22px;
  }
  small {
    color: ${({ theme }) => theme.colors.mutedText};
    display: block;
  }
`
const Shell = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 360px minmax(0, 1fr);
  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
`
const Pane = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.colors.radii?.lg || '12px'};
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr auto;
`
const PaneHead = styled.div`
  padding: 12px 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`
const PaneBody = styled.div`
  min-height: 420px;
  max-height: 70vh;
  overflow: auto;
`
const PaneFoot = styled.div`
  padding: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: grid;
  gap: 8px;
`
const Avatar = styled.img`
  width: 34px;
  height: 34px;
  border-radius: 999px;
  object-fit: cover;
  background: #eee;
  border: 1px solid ${({ theme }) => theme.colors.border};
`

export default function AdminContact() {
  // INBOX
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [inbox, setInbox] = useState([])
  const [loadingInbox, setLoadingInbox] = useState(true)
  const totalPages = Math.max(1, Math.ceil(total / limit))

  // CONVERSACIÓN
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [selectedUserName, setSelectedUserName] = useState('')
  const [selectedUserAvatar, setSelectedUserAvatar] = useState('')
  const [thread, setThread] = useState([])
  const [loadingThread, setLoadingThread] = useState(false)

  // COMPOSE (panel derecho)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  // MODAL nuevo mensaje
  const [openNew, setOpenNew] = useState(false)
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [newTo, setNewTo] = useState(null)
  const [newSubject, setNewSubject] = useState('')
  const [newBody, setNewBody] = useState('')

  // cargar inbox
  const loadInbox = async (p = page) => {
    setLoadingInbox(true)
    try {
      const data = await listAdminInbox({ page: p, limit })
      const items = Array.isArray(data?.items) ? data.items : []
      const grouped = compactByUser(items)
      setInbox(grouped)
      setTotal(data?.total || grouped.length)
    } finally {
      setLoadingInbox(false)
    }
  }

  useEffect(() => {
    loadInbox(1)
  }, [])
  useEffect(() => {
    if (page > 1) loadInbox(page)
  }, [page])

  const loadThread = async (userId) => {
    setLoadingThread(true)
    try {
      const data = await getAdminThreadWithUser(userId)
      const msgs = Array.isArray(data?.messages) ? data.messages : []
      const norm = msgs.map((m) => {
        const fromId = m.from?._id || m.from?.id
        const me = String(fromId || '') !== String(userId)
        return {
          id: m._id || m.id,
          me,
          fromName: me ? 'Tú' : m.from?.name || 'Usuario',
          subject: trimSubject(m.subject || ''),
          body: m.body || '',
          createdAt: m.createdAt || Date.now()
        }
      })
      setThread(norm)
    } finally {
      setLoadingThread(false)
    }
  }

  const openConversation = async (it) => {
    setSelectedUserId(it.userId)
    setSelectedUserName(it.userName)
    setSelectedUserAvatar(it.userAvatar)
    setSubject((prev) => (prev ? prev : `Re: ${trimSubject(it.subject)}`))
    setBody('')
    try {
      markAllFromUserRead(it.userId).catch(() => null)
    } catch {}
    await loadThread(it.userId)
  }

  const send = async () => {
    if (!selectedUserId) return alert('Selecciona un usuario.')
    if (!subject.trim() && !body.trim())
      return alert('Escribe asunto o mensaje.')
    try {
      await adminSendMessageToUser(selectedUserId, {
        subject: subject.trim(),
        body: body.trim()
      })
      setBody('')
      await Promise.all([loadThread(selectedUserId), loadInbox(page)])
    } catch (e) {
      console.error(e)
      alert('No se pudo enviar el mensaje.')
    }
  }

  const onDeleteThread = async (userId, userName) => {
    const ok = window.confirm(`Eliminar conversación con ${userName}?`)
    if (!ok) return
    try {
      await deleteAdminThread(userId)
      if (String(userId) === String(selectedUserId)) {
        setSelectedUserId(null)
        setSelectedUserName('')
        setSelectedUserAvatar('')
        setThread([])
        setSubject('')
        setBody('')
      }
      await loadInbox(page)
    } catch (e) {
      console.error(e)
      alert('No se pudo eliminar la conversación.')
    }
  }

  // Modal "nuevo"
  const searchUsers = async () => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setSearching(true)
    try {
      const data = await listUsersAdmin({ q, page: 1, limit: 20 })
      const arr = Array.isArray(data?.users) ? data.users : []
      setResults(arr)
    } finally {
      setSearching(false)
    }
  }

  const sendNew = async () => {
    if (!newTo?._id) return alert('Selecciona un usuario.')
    if (!newSubject.trim() && !newBody.trim())
      return alert('Escribe asunto o mensaje.')
    try {
      await adminSendMessageToUser(newTo._id, {
        subject: newSubject.trim(),
        body: newBody.trim()
      })
      setOpenNew(false)
      setNewTo(null)
      setNewSubject('')
      setNewBody('')
      setQ('')
      setResults([])
      await loadInbox(1)
      const found = compactByUser(
        (await listAdminInbox({ page: 1, limit })).items || []
      ).find((x) => String(x.userId) === String(newTo._id))
      if (found) openConversation(found)
    } catch (e) {
      console.error(e)
      alert('No se pudo enviar el mensaje.')
    }
  }

  const selectedLabel = useMemo(
    () =>
      selectedUserName
        ? `Conversación con ${selectedUserName}`
        : 'Conversación',
    [selectedUserName]
  )

  return (
    <>
      <Wrap>
        <Head>
          <div>
            <h2>Contacto</h2>
            <small>Bandeja de entrada y mensajería interna</small>
          </div>
          <Button onClick={() => setOpenNew(true)}>Enviar mensaje</Button>
        </Head>

        <Shell>
          {/* BANDEJA */}
          <Pane>
            <PaneHead>
              <div style={{ fontWeight: 700 }}>Bandeja de entrada</div>
            </PaneHead>
            <PaneBody>
              <InboxList
                inbox={inbox}
                loading={loadingInbox}
                selectedUserId={selectedUserId}
                page={page}
                totalPages={totalPages}
                onChangePage={(n) =>
                  setPage(Math.max(1, Math.min(totalPages, n)))
                }
                onSelect={openConversation}
                onDeleteThread={onDeleteThread}
              />
            </PaneBody>
            <PaneFoot />
          </Pane>

          {/* CONVERSACIÓN */}
          <Pane>
            <PaneHead>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {selectedUserId ? (
                  <Avatar
                    src={selectedUserAvatar || AVATAR_PLACEHOLDER}
                    alt={selectedUserName}
                    onError={(e) => {
                      if (e.currentTarget.src !== AVATAR_PLACEHOLDER)
                        e.currentTarget.src = AVATAR_PLACEHOLDER
                    }}
                  />
                ) : null}
                <div style={{ fontWeight: 700 }}>{selectedLabel}</div>
              </div>
              {selectedUserId ? (
                <small style={{ color: '#64748b' }}>ID: {selectedUserId}</small>
              ) : null}
            </PaneHead>

            <PaneBody>
              <ThreadView
                loading={loadingThread}
                selectedUserId={selectedUserId}
                thread={thread}
              />
            </PaneBody>

            <PaneFoot>
              <Composer
                subject={subject}
                setSubject={setSubject}
                body={body}
                setBody={setBody}
                disabled={!selectedUserId}
                onSend={send}
              />
            </PaneFoot>
          </Pane>
        </Shell>
      </Wrap>

      {/* Modal nuevo mensaje */}
      <NewMessageModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        q={q}
        setQ={setQ}
        searching={searching}
        onSearch={searchUsers}
        results={results}
        newTo={newTo}
        setNewTo={setNewTo}
        newSubject={newSubject}
        setNewSubject={setNewSubject}
        newBody={newBody}
        setNewBody={setNewBody}
        onSend={sendNew}
      />
    </>
  )
}
