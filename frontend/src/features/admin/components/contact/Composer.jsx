// frontend/src/features/admin/pages/contact/Composer.jsx
import React from 'react'
import styled from 'styled-components'
import Button from '../../components/Button.jsx'

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

export default function Composer({
  subject,
  setSubject,
  body,
  setBody,
  disabled,
  onSend
}) {
  return (
    <>
      <Input
        placeholder='Asunto'
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        disabled={disabled}
      />
      <Textarea
        placeholder={disabled ? 'Elige un usuario…' : 'Escribe tu respuesta…'}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={disabled}
      />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'end' }}>
        <Button onClick={onSend} disabled={disabled}>
          Enviar
        </Button>
      </div>
    </>
  )
}
