// frontend/src/features/admin/pages/contact/NewMessageModal.jsx
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
  open,
  onClose,
  q,
  setQ,
  searching,
  onSearch,
  results,
  newTo,
  setNewTo,
  newSubject,
  setNewSubject,
  newBody,
  setNewBody,
  onSend
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
        <div style={{ display: 'flex', gap: 8 }}>
          <Input
            placeholder='Buscar usuario por nombre o email…'
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
          <Button onClick={onSearch} disabled={searching}>
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
  )
}
