import React from 'react'
import styled from 'styled-components'
import { Eye, EyeOff } from 'lucide-react'

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  padding: 16px;
  display: grid;
  gap: 12px;
`
const SectionTitle = styled.h3`
  margin: 0 0 6px 0;
  font-size: 18px;
`
const Field = styled.label`
  display: grid;
  gap: 6px;
`
const Label = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`
const Input = (props) => (
  <input
    {...props}
    style={{
      width: '100%',
      padding: '10px 12px',
      border: '1px solid var(--border,#E2E8F0)',
      borderRadius: 10
    }}
  />
)
const Textarea = (props) => (
  <textarea
    {...props}
    style={{
      width: '100%',
      padding: '10px 12px',
      border: '1px solid var(--border,#E2E8F0)',
      borderRadius: 10
    }}
  />
)
const Muted = styled.small`
  color: #64748b;
`

export default function ProfileDetailsSection({
  editing,
  current,
  form,
  onChangeForm,
  pw,
  onChangePw,
  showCurrent,
  showNext,
  setShowCurrent,
  setShowNext,
  pwMsg
}) {
  const lockStyle = {
    opacity: editing ? 1 : 0.6,
    pointerEvents: editing ? 'auto' : 'none'
  }

  return (
    <Card>
      <SectionTitle>Datos del administrador</SectionTitle>

      <Field>
        <Label>Nombre</Label>
        <Input
          disabled={!editing}
          placeholder={current.name || '—'}
          value={editing ? form.name : current.name}
          onChange={onChangeForm('name')}
        />
      </Field>

      <Field>
        <Label>Email</Label>
        <Input
          type='email'
          disabled={!editing}
          placeholder={current.email || '—'}
          value={editing ? form.email : current.email}
          onChange={onChangeForm('email')}
        />
      </Field>

      <div style={{ display: 'grid', gap: 10, ...lockStyle }}>
        <Field>
          <Label>Contraseña actual</Label>
          <div style={{ position: 'relative' }}>
            <Input
              type={showCurrent ? 'text' : 'password'}
              placeholder='••••••••'
              value={pw.current}
              onChange={onChangePw('current')}
            />
            <button
              type='button'
              onClick={() => setShowCurrent((v) => !v)}
              title={showCurrent ? 'Ocultar' : 'Mostrar'}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                border: 0,
                background: 'transparent',
                cursor: 'pointer'
              }}
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        <Field>
          <Label>Nueva contraseña</Label>
          <div style={{ position: 'relative' }}>
            <Input
              type={showNext ? 'text' : 'password'}
              placeholder='••••••••'
              value={pw.next}
              onChange={onChangePw('next')}
            />
            <button
              type='button'
              onClick={() => setShowNext((v) => !v)}
              title={showNext ? 'Ocultar' : 'Mostrar'}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                border: 0,
                background: 'transparent',
                cursor: 'pointer'
              }}
            >
              {showNext ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        {pwMsg ? <Muted>{pwMsg}</Muted> : null}
      </div>

      <Field>
        <Label>Descripción</Label>
        <Textarea
          rows={4}
          disabled={!editing}
          placeholder={current.description || 'Sobre mí…'}
          value={editing ? form.description : current.description}
          onChange={onChangeForm('description')}
        />
      </Field>
    </Card>
  )
}
