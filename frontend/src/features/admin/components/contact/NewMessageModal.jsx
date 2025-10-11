import React from 'react'
import styled from 'styled-components'
import Modal from '../../components/Modal.jsx'
import Button from '../../components/Button.jsx'
import { AVATAR_PLACEHOLDER } from '../../../../constants/media'

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
const Avatar = styled.img`
  width: 34px;
  height: 34px;
  border-radius: 999px;
  object-fit: cover;
  background: #eee;
`

export default function NewMessageModal({
  open, // visible/oculto
  onClose,
  q,
  setQ, //  query y setter para user search
  searching,
  onSearch, //  handler llama listUsersAdmin para search
  results, //  array users
  newTo,
  setNewTo, //  user destino
  newSubject,
  setNewSubject,
  newBody,
  setNewBody,
  onSend // enviar msg
}) {
  return (
    <Modal
      open={open}
      title='Enviar mensaje'
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} variant='secondary'>
            Cancelar
          </Button>
          <Button onClick={onSend}>Enviar</Button>
        </>
      }
    >
      <div style={{ display: 'grid', gap: 10 }}>
        {/*  user searcher*/}
        <div style={{ display: 'flex', gap: 8 }}>
          <Input
            placeholder='Buscar usuario por nombre o email…'
            value={q}
            onChange={(e) => setQ(e.target.value)} // ← escribe query
            onKeyDown={(e) => e.key === 'Enter' && onSearch()} // ← enter = buscar
          />
          <Button onClick={onSearch} disabled={searching}>
            {searching ? 'Buscando…' : 'Buscar'}
          </Button>
        </div>

        {/* ======== Resultados de búsqueda (selección de destinatario) ======== */}
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
                onClick={() => setNewTo(u)} // ← elegir destinatario
                style={{
                  padding: 8,
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  background:
                    String(newTo?._id) === String(u._id) ? '#f5f3ff' : '#fff' // ← resalta seleccionado
                }}
                title={u.email}
              >
                <Avatar
                  src={u.avatar || AVATAR_PLACEHOLDER}
                  alt={u.name || u.email}
                  onError={(e) => {
                    // ← fallback avatar
                    if (e.currentTarget.src !== AVATAR_PLACEHOLDER)
                      e.currentTarget.src = AVATAR_PLACEHOLDER
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>{u.name || 'Usuario'}</div>
                  <div
                    style={{
                      color: '#64748b',
                      fontSize: 12,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {u.email}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ======== Asunto + cuerpo ======== */}
        <Input
          placeholder='Asunto'
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)} // ← 2-way
        />
        <Textarea
          placeholder='Escribe el mensaje…'
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)} // ← 2-way
        />

        {/* ======== Ayuda de contexto ======== */}
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
  )
}
