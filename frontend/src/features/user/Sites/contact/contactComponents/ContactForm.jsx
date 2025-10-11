import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const SectionBox = styled.section`
  border: 1px solid ${({ theme }) => theme.colors?.border || '#eee'};
  background: ${({ theme }) => theme.colors?.cardBg || '#fff'};
  border-radius: ${({ theme }) => theme.radii?.lg || '16px'};
  padding: 16px;
  display: grid;
  gap: 12px;
`
const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#ddd'};
  background: #fff;
  border-radius: 10px;
  width: 100%;
`
const Textarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#ddd'};
  background: #fff;
  border-radius: 10px;
  width: 100%;
`
const Button = styled.button`
  padding: 10px 14px;
  background: ${({ theme }) => theme.colors?.primary || '#8b5cf6'};
  color: #fff;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`
const Muted = styled.p`
  color: ${({ theme }) => theme.colors?.mutedText || '#666'};
  margin: 0;
`

export default function ContactForm({
  token,
  subject,
  onSubject,
  body,
  onBody,
  sending,
  sentOk,
  error,
  onSubmit
}) {
  return (
    <SectionBox>
      {/* // si no hay token , muestra aviso con enlaces login register */}

      {!token ? (
        <>
          <h2 style={{ margin: 0, color: 'inherit' }}>Escríbenos</h2>
          <Muted>
            Debes estar identificado para enviar un mensaje.{' '}
            <Link to='/login'>Inicia sesión</Link> o{' '}
            <Link to='/register'>crea tu cuenta</Link>.
          </Muted>
        </>
      ) : (
        <>
          {/* si hay token, formulario con asunto mensaje y boton enviar */}
          <h2 style={{ margin: 0, color: 'inherit' }}>Escríbenos</h2>
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
            <label>
              <div>Asunto</div>
              <Input
                placeholder='Cuéntanos brevemente el motivo…'
                value={subject}
                onChange={(e) => onSubject(e.target.value)}
              />
            </label>
            <label>
              <div>Mensaje</div>
              <Textarea
                rows={5}
                placeholder='Escribe tu mensaje para el equipo de KBOOK…'
                value={body}
                onChange={(e) => onBody(e.target.value)}
              />
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Button type='submit' disabled={sending}>
                {sending ? 'Enviando…' : 'Enviar mensaje'}
              </Button>
              {sentOk && (
                <span style={{ color: '#16a34a' }}>¡Mensaje enviado!</span>
              )}
              {error && <span style={{ color: '#dc2626' }}>{error}</span>}
            </div>
          </form>
          <Muted style={{ fontSize: 12 }}>
            Responderemos lo antes posible. Si tu consulta está vinculada a un
            pedido, facilite el nombre del libro adquirido o numero de pedido.
          </Muted>
        </>
      )}
    </SectionBox>
  )
}
