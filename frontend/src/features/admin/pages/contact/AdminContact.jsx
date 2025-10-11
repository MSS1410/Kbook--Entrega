import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import Button from '../../components/Button.jsx'
import Modal from '../../components/Modal.jsx' // dispo en otros lugares
import {
  listAdminInbox, // API: obtiene mensajes "crudos" del inbox adminn ya paged
  getAdminThreadWithUser, //  API: obtiene el hilo completo con un usuario
  adminSendMessageToUser, // API: envia un msj al usuario . Crea o continua hilo
  listUsersAdmin, // API: buscar usuarios (para el "new" modal )
  markAllFromUserRead, // API: marca como leidos los mensajes de ese user
  deleteAdminThread //  API: elimina toda la conv con un user
} from '../../api/adminApi.js'
import InboxList from '../../components/contact/InboxList.jsx' // lista de conversaciones (1 por user)
import ThreadView from '../../components/contact/ThreadView.jsx' //  ventana del hilo con burbujas
import Composer from '../../components/contact/Composer.jsx' //  formulario asunto + cuerpo + enviar
import NewMessageModal from '../../components/contact/NewMessageModal.jsx' // modal para iniciar chat
import {
  compactByUser, //  agrupa mensajes crudos por usuario y se queda con el nas reciente + flag unread
  trimSubject //  limpia prefijos tipo RE  para que no se repitan buclados
} from '../../components/contact/contactUtils.js'
import { AVATAR_PLACEHOLDER } from '../../../../constants/media'

/*  Layout  */
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
  grid-template-columns: 360px minmax(0, 1fr); // ← panel izq: inbox | dcha: hilo
  @media (max-width: 1000px) {
    grid-template-columns: 1fr; // ← móvil: apila
  }
`
const Pane = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.colors.radii?.lg || '12px'};
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr auto; // ← header, body scroll, footer (composer)
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
  max-height: 70vh; // ← se ve como “panel” con scroll
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
  /*  STATE: INBOX ( izq )  */
  const [page, setPage] = useState(1) //   actual page del inbox
  const [limit] = useState(10) // ← tamaño de pg para  inbox
  const [total, setTotal] = useState(0) //  total de conversaciones group
  const [inbox, setInbox] = useState([]) //  items group por usuario ///// compactByUser
  const [loadingInbox, setLoadingInbox] = useState(true)
  const totalPages = Math.max(1, Math.ceil(total / limit)) //  num pag

  /*  STATE: CHAT (RIGHT)  */
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [selectedUserName, setSelectedUserName] = useState('')
  const [selectedUserAvatar, setSelectedUserAvatar] = useState('')
  const [thread, setThread] = useState([]) //  mensajes normalizados del hilo con user sel
  const [loadingThread, setLoadingThread] = useState(false)

  /*  STATE: COMPOSER ( msg text site) (habilita answer)  */
  const [subject, setSubject] = useState('') //  asunto act
  const [body, setBody] = useState('') // cuerpo del msg

  /*  STATE: MODAL - new msg  */
  const [openNew, setOpenNew] = useState(false) //  abrir cerrar modal
  const [q, setQ] = useState('') // query para search de users
  const [results, setResults] = useState([]) //  search results
  const [searching, setSearching] = useState(false)
  const [newTo, setNewTo] = useState(null) // usuario  selected en modal a quien va el msg
  const [newSubject, setNewSubject] = useState('')
  const [newBody, setNewBody] = useState('')

  /*  ACCION: CARGA DE INBOX .paged.  */
  const loadInbox = async (p = page) => {
    setLoadingInbox(true)
    try {
      const data = await listAdminInbox({ page: p, limit }) // pide mensajes crudos
      const items = Array.isArray(data?.items) ? data.items : []
      const grouped = compactByUser(items) // agrupa por user y destaca no leidos si hay
      setInbox(grouped)
      setTotal(data?.total || grouped.length) // si no viene total grouped lenttgh
    } finally {
      setLoadingInbox(false)
    }
  }

  useEffect(() => {
    loadInbox(1) // primera carga al montar
  }, [])
  useEffect(() => {
    if (page > 1) loadInbox(page) //  recarga si cambiamos pag
  }, [page])

  /*  ACT: CARGA DE USER HILO THREAD  */
  const loadThread = async (userId) => {
    setLoadingThread(true)
    try {
      const data = await getAdminThreadWithUser(userId) /// pide { messages: [...] }
      const msgs = Array.isArray(data?.messages) ? data.messages : []
      const norm = msgs.map((m) => {
        // normaliza cada MSG para el UI
        const fromId = m.from?._id || m.from?.id
        const me = String(fromId || '') !== String(userId) // if not user, so me (admin)
        return {
          id: m._id || m.id,
          me, //  controla lado y style n color de la burbuja
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

  /*  ACCION:  ABRIR CHAT DESDE LIST , INBOitem */
  const openConversation = async (it) => {
    setSelectedUserId(it.userId)
    setSelectedUserName(it.userName)
    setSelectedUserAvatar(it.userAvatar)
    setSubject((prev) => (prev ? prev : `Re: ${trimSubject(it.subject)}`)) // precarga asunto si empty
    setBody('')
    try {
      markAllFromUserRead(it.userId).catch(() => null) // ← marca como leigo
    } catch {}
    await loadThread(it.userId) // hilo entonces right chatpanel
  }

  /*  ACCION: ENVIAR RESPUESTA EN EL CHAT  */
  const send = async () => {
    if (!selectedUserId) return alert('Selecciona un usuario.') //  GUARD UX
    if (!subject.trim() && !body.trim())
      return alert('Escribe asunto o mensaje.')
    try {
      await adminSendMessageToUser(selectedUserId, {
        //  POST msg
        subject: subject.trim(),
        body: body.trim()
      })
      setBody('') // clean textarea
      //  refresca hilo + inbox
      await Promise.all([loadThread(selectedUserId), loadInbox(page)])
    } catch (e) {
      console.error(e)
      alert('No se pudo enviar el mensaje.')
    }
  }

  /*  ACCION: DELETE ALL CHAT  */
  const onDeleteThread = async (userId, userName) => {
    const ok = window.confirm(`Eliminar conversación con ${userName}?`) //  confirm UX
    if (!ok) return
    try {
      await deleteAdminThread(userId) //  DELETE hilo
      if (String(userId) === String(selectedUserId)) {
        // si se borra el hilo abierto
        setSelectedUserId(null)
        setSelectedUserName('')
        setSelectedUserAvatar('')
        setThread([])
        setSubject('')
        setBody('')
      }
      await loadInbox(page) // refresca inbox
    } catch (e) {
      console.error(e)
      alert('No se pudo eliminar la conversación.')
    }
  }

  /*  MODAL - SEARCH USERS */
  const searchUsers = async () => {
    if (!q.trim()) {
      setResults([]) // limpia empty query
      return
    }
    setSearching(true)
    try {
      const data = await listUsersAdmin({ q, page: 1, limit: 20 }) // backend debe soportar q
      const arr = Array.isArray(data?.users) ? data.users : []
      //muestro lista seleccionable
      setResults(arr)
    } finally {
      setSearching(false)
    }
  }

  /*  MODAL : ENVIAR PRIMER MSG  */
  const sendNew = async () => {
    if (!newTo?._id) return alert('Selecciona un usuario.')
    if (!newSubject.trim() && !newBody.trim())
      return alert('Escribe asunto o mensaje.')
    try {
      await adminSendMessageToUser(newTo._id, {
        //  creo / abro hilo con ese user
        subject: newSubject.trim(),
        body: newBody.trim()
      })
      // limpio estado del modal
      setOpenNew(false)
      setNewTo(null)
      setNewSubject('')
      setNewBody('')
      setQ('')
      setResults([])
      // refresh inbox, abrir recent created
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

  /*  info para header del hilo  */
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
          {/* abre modal nuevo, inicia hilo con usuario  */}
        </Head>

        <Shell>
          {/*  BANDEJA (izq)  */}
          <Pane>
            <PaneHead>
              <div style={{ fontWeight: 700 }}>Bandeja de entrada</div>
            </PaneHead>
            <PaneBody>
              <InboxList
                inbox={inbox} // ya viene agrupado por user
                loading={loadingInbox}
                selectedUserId={selectedUserId}
                page={page}
                totalPages={totalPages}
                onChangePage={
                  (n) => setPage(Math.max(1, Math.min(totalPages, n))) // page guard
                }
                onSelect={openConversation} // al hacer click en un item
                onDeleteThread={onDeleteThread} // eliminar hilo desde el listado
              />
            </PaneBody>
            <PaneFoot />{' '}
            {/*  creo empty bottom para simetria espacios faciles */}
          </Pane>

          {/*  CHAT (der)  */}
          <Pane>
            <PaneHead>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {selectedUserId ? (
                  <Avatar
                    src={selectedUserAvatar || AVATAR_PLACEHOLDER}
                    alt={selectedUserName}
                    onError={(e) => {
                      //  img fall
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
                disabled={!selectedUserId} // bloqueado si no hay user seleccionado
                onSend={send} // enviar respuesta
              />
            </PaneFoot>
          </Pane>
        </Shell>
      </Wrap>

      {/*  MODAL: NUEVO MSG  */}
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
