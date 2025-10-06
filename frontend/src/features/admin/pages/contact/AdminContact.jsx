// frontend/src/features/admin/pages/contact/AdminContact.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import Button from '../../components/Button.jsx'
import Modal from '../../components/Modal.jsx'
import {
  listAdminInbox,
  getAdminThreadWithUser,
  adminSendMessageToUser,
  listUsersAdmin,
  markAllFromUserRead,
  deleteAdminThread
} from '../../api/adminApi.js'
import { AVATAR_PLACEHOLDER } from '../../../../constants/media'

// ====== UI base ======
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
  border-radius: ${({ theme }) => theme.radii.lg};
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

// ====== Lista bandeja ======
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

// ====== Conversación ======
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
  background: ${({ $me }) => ($me ? '#f5f3ff' : '#ecfdf5')}; /* lila / verde */
  justify-self: ${({ $me }) => ($me ? 'end' : 'start')};
  white-space: pre-wrap;
  word-break: break-word;
`
const Sender = styled.div`
  font-weight: 800;
  color: ${({ $me }) => ($me ? '#8b5cf6' : '#10b981')}; /* lila / verde */
  margin-bottom: 4px;
  text-align: ${({ $me }) => ($me ? 'right' : 'left')};
`
const Meta = styled.div`
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
  justify-self: ${({ $me }) => ($me ? 'end' : 'start')};
`

// ====== Compose ======
const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 10px;
`
const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 10px;
  min-height: 90px;
  resize: vertical;
`

// ====== Pager ======
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

const fmtDateTime = (iso) => new Date(iso).toLocaleString()
const trimSubject = (s = '') =>
  String(s)
    .replace(/^(\s*(re:|respuesta:)\s*)+/gi, '')
    .trim()

// Normaliza un item crudo del inbox → tomamos SIEMPRE el remitente usuario (fromUser)
function normalizeInboxItem(m) {
  const u = m.fromUser || {}
  return {
    messageId: m._id,
    userId: u?._id,
    userName: u?.name || u?.email || 'Usuario',
    userAvatar: u?.avatar || '',
    subject: m.subject || '(Sin asunto)',
    snippet: m.body || '',
    createdAt: m.createdAt,
    read: !!m.read
  }
}

// Agrupa por usuario y deja solo el ÚLTIMO mensaje (y unread si alguno del grupo está sin leer)
function compactByUser(items) {
  const map = new Map()
  for (const raw of items) {
    const it = normalizeInboxItem(raw)
    const key = String(it.userId)
    const prev = map.get(key)
    if (!prev || new Date(it.createdAt) > new Date(prev.createdAt)) {
      map.set(key, { ...it })
    }
    // si cualquier msg del usuario viene unread en esta página, marcamos unread
    if (!it.read) {
      const cur = map.get(key)
      map.set(key, { ...cur, unread: true })
    }
  }
  // a falta de total por usuario, ordenamos por createdAt desc
  return [...map.values()].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  )
}

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

  // MODAL: mensaje nuevo
  const [openNew, setOpenNew] = useState(false)
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [newTo, setNewTo] = useState(null)
  const [newSubject, setNewSubject] = useState('')
  const [newBody, setNewBody] = useState('')

  const bottomRef = useRef(null)

  // Cargar inbox (paginado)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (page > 1) loadInbox(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  // Abrir conversación (y marcar leídos los de ese usuario)
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
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }),
        30
      )
    } finally {
      setLoadingThread(false)
    }
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
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }),
        30
      )
    } catch (e) {
      console.error(e)
      alert('No se pudo enviar el mensaje.')
    }
  }

  // Eliminar conversación completa desde el card (papelera)
  const onDeleteThread = async (userId, userName) => {
    const ok = window.confirm(`Eliminar conversación con ${userName}?`)
    if (!ok) return
    try {
      await deleteAdminThread(userId)
      // limpiar si era la activa
      if (String(userId) === String(selectedUserId)) {
        setSelectedUserId(null)
        setSelectedUserName('')
        setSelectedUserAvatar('')
        setThread([])
        setSubject('')
        setBody('')
      }
      // recargar bandeja
      await loadInbox(page)
    } catch (e) {
      console.error(e)
      alert('No se pudo eliminar la conversación.')
    }
  }

  // ===== Modal: nuevo mensaje =====
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
      // refrescar bandeja y abrir la conversación
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
          {/* ====== BANDEJA ====== */}
          <Pane>
            <PaneHead>
              <div style={{ fontWeight: 700 }}>Bandeja de entrada</div>
              {/* <small style={{ color: '#64748b' }}>
                Página {page} · {total} mensajes
              </small> */}
            </PaneHead>

            <PaneBody>
              {loadingInbox ? (
                <div style={{ padding: 12 }}>Cargando…</div>
              ) : inbox.length === 0 ? (
                <div style={{ padding: 12, color: '#64748b' }}>
                  Aún no hay mensajes.
                </div>
              ) : (
                <List>
                  {inbox.map((it, i) => (
                    <Item
                      key={it.userId || 'user-${i}'}
                      $active={String(selectedUserId) === String(it.userId)}
                      $unread={!!it.unread}
                      onClick={() => openConversation(it)}
                      title={trimSubject(it.subject)}
                    >
                      <Row>
                        <Avatar
                          src={it.userAvatar || AVATAR_PLACEHOLDER}
                          alt={it.userName}
                          onError={(e) => {
                            if (e.currentTarget.src !== AVATAR_PLACEHOLDER) {
                              e.currentTarget.src = AVATAR_PLACEHOLDER
                            }
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <Title>{it.userName}</Title>
                          <Snippet>
                            {trimSubject(it.subject) || '(Sin asunto)'}
                          </Snippet>
                          <Muted style={{ whiteSpace: 'normal' }}>
                            {it.snippet}
                          </Muted>
                        </div>
                        <Right onClick={(e) => e.stopPropagation()}>
                          <Muted>{fmtDateTime(it.createdAt)}</Muted>
                          <TrashBtn
                            onClick={() =>
                              onDeleteThread(it.userId, it.userName)
                            }
                          >
                            🗑 Eliminar
                          </TrashBtn>
                        </Right>
                      </Row>
                    </Item>
                  ))}
                </List>
              )}
            </PaneBody>

            <PaneFoot>
              <Pager>
                <PageBtn
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  ‹ Anterior
                </PageBtn>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (n) => (
                    <PageBtn
                      key={n}
                      $active={n === page}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </PageBtn>
                  )
                )}
                <PageBtn
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Siguiente ›
                </PageBtn>
              </Pager>
            </PaneFoot>
          </Pane>

          {/* ====== CONVERSACIÓN ====== */}
          <Pane>
            <PaneHead>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {selectedUserId ? (
                  <Avatar
                    src={selectedUserAvatar || AVATAR_PLACEHOLDER}
                    alt={selectedUserName}
                    onError={(e) => {
                      if (e.currentTarget.src !== AVATAR_PLACEHOLDER) {
                        e.currentTarget.src = AVATAR_PLACEHOLDER
                      }
                    }}
                    style={{ width: 34, height: 34 }}
                  />
                ) : null}
                <div style={{ fontWeight: 700 }}>{selectedLabel}</div>
              </div>
              {selectedUserId ? (
                <small style={{ color: '#64748b' }}>ID: {selectedUserId}</small>
              ) : null}
            </PaneHead>

            <PaneBody>
              {loadingThread ? (
                <div style={{ padding: 12 }}>Cargando conversación…</div>
              ) : !selectedUserId ? (
                <div style={{ padding: 12, color: '#64748b' }}>
                  Selecciona un mensaje o usa “Enviar mensaje”.
                </div>
              ) : thread.length === 0 ? (
                <div style={{ padding: 12, color: '#64748b' }}>
                  No hay mensajes aún con este usuario.
                </div>
              ) : (
                <Thread>
                  {thread.map((m, i) => {
                    const key =
                      m.id ||
                      m._id ||
                      (m.createdAt ? `${m.createdAt}-${i}` : `tmp-${i}`)

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
              )}
            </PaneBody>

            {/* Composer en el panel derecho */}
            <PaneFoot>
              <Input
                placeholder='Asunto'
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={!selectedUserId}
              />
              <Textarea
                placeholder={
                  selectedUserId ? 'Escribe tu respuesta…' : 'Elige un usuario…'
                }
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={!selectedUserId}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'end' }}>
                <Button onClick={send} disabled={!selectedUserId}>
                  Enviar
                </Button>
              </div>
            </PaneFoot>
          </Pane>
        </Shell>
      </Wrap>

      {/* ===== Modal: Enviar mensaje ===== */}
      <Modal
        open={openNew}
        title='Enviar mensaje'
        onClose={() => setOpenNew(false)}
        footer={
          <>
            <Button onClick={() => setOpenNew(false)} variant='secondary'>
              Cancelar
            </Button>
            <Button onClick={sendNew}>Enviar</Button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input
              placeholder='Buscar usuario por nombre o email…'
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
            />
            <Button onClick={searchUsers} disabled={searching}>
              {searching ? 'Buscando…' : 'Buscar'}
            </Button>
          </div>

          {!!results.length && (
            <div
              style={{
                display: 'grid',
                gap: 6,
                maxHeight: 220,
                overflow: 'auto'
              }}
            >
              {results.map((u) => (
                <div
                  key={u._id}
                  onClick={() => setNewTo(u)}
                  style={{
                    padding: 8,
                    border: '1px solid #e5e7eb',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    background:
                      String(newTo?._id) === String(u._id) ? '#f5f3ff' : '#fff'
                  }}
                  title={u.email}
                >
                  <Avatar
                    src={u.avatar || AVATAR_PLACEHOLDER}
                    alt={u.name || u.email}
                    onError={(e) => {
                      if (e.currentTarget.src !== AVATAR_PLACEHOLDER) {
                        e.currentTarget.src = AVATAR_PLACEHOLDER
                      }
                    }}
                    style={{ width: 34, height: 34 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>{u.name || 'Usuario'}</div>
                    <Muted>{u.email}</Muted>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Input
            placeholder='Asunto'
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />
          <Textarea
            placeholder='Escribe el mensaje…'
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
          />

          {newTo ? (
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Para: <b>{newTo.name || newTo.email}</b>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Selecciona un destinatario para enviar.
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}
