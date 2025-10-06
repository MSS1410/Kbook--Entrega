// frontend/src/components/profile/PersonalSection.jsx
import React, { useState } from 'react'
import styled from 'styled-components'
import useAuth from '../../hooks/useAuth'
import api from '../../api'
import AvatarUploader from './AvatarUploader'

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
`
const SectionTitle = styled.h2`
  margin: 0 0 12px 0;
  color: ${({ theme }) => theme.colors?.primary || '#8b5cf6'};
`
const Row = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`
const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
  }
`
const GhostButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
`
const Field = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`
const Label = styled.label`
  display: block;
  margin-bottom: 4px;
  font-weight: 700;
`
const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid #ccc;
  border-radius: ${({ theme }) => theme.radii.sm};
`
const Textarea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid #ccc;
  border-radius: ${({ theme }) => theme.radii.sm};
`
const ErrorText = styled.div`
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
`
const Muted = styled.small`
  color: #64748b;
`

export default function PersonalSection() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    description: user?.description || '',
    pwCurrent: '',
    pwNext: ''
  })
  const [edit, setEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [pwMsg, setPwMsg] = useState('')

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'El nombre es obligatorio.'
    if (form.description.length > 500) e.description = 'Máx. 500 caracteres.'
    if (!form.email.trim()) {
      e.email = 'El email es obligatorio.'
    } else {
      const basicEmail = /.+@.+\..+/
      if (!basicEmail.test(form.email.trim())) e.email = 'Email no válido.'
    }
    if ((form.pwCurrent && !form.pwNext) || (!form.pwCurrent && form.pwNext)) {
      e.password = 'Completa ambas contraseñas para actualizar.'
    }
    if (form.pwNext && form.pwNext.length < 6) {
      e.password = 'La nueva contraseña debe tener al menos 6 caracteres.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async () => {
    setPwMsg('')
    if (!validate()) return
    setSaving(true)

    // 1) Actualizar nombre/email/descripcion
    try {
      const res = await api.put(
        '/api/users/profile',
        {
          name: form.name,
          email: form.email,
          description: form.description
        },
        { headers: { 'Content-Type': 'application/json' } }
      )
      const updated = res.data?.user || res.data
      if (updated) setUser(updated)
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Error guardando datos personales (perfil).'
      alert(msg)
      setSaving(false)
      return
    }

    // 2) Cambiar contraseña (opcional)
    if (form.pwCurrent || form.pwNext) {
      try {
        await api.patch(
          '/api/users/me/password',
          { currentPassword: form.pwCurrent, newPassword: form.pwNext },
          { headers: { 'Content-Type': 'application/json' } }
        )
        setPwMsg('Contraseña actualizada.')
        setForm((f) => ({ ...f, pwCurrent: '', pwNext: '' }))
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          'No se pudo cambiar la contraseña (verifica la actual).'
        setErrors((prev) => ({ ...prev, password: msg }))
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setEdit(false)
  }

  return (
    <Card>
      <SectionTitle>Información personal</SectionTitle>

      {/* Uploader único (incluye preview, cambiar y quitar foto) */}
      <AvatarUploader />

      <Field>
        <Label>Nombre</Label>
        <Input
          value={form.name}
          disabled={!edit}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        {errors.name && <ErrorText>{errors.name}</ErrorText>}
      </Field>

      <Field>
        <Label>Email</Label>
        <Input
          type='email'
          value={form.email}
          disabled={!edit}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        {errors.email && <ErrorText>{errors.email}</ErrorText>}
      </Field>

      <Field>
        <Label>Descripción</Label>
        <Textarea
          rows={4}
          value={form.description}
          disabled={!edit}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />
        {errors.description && <ErrorText>{errors.description}</ErrorText>}
      </Field>

      {/* Password (opcional) */}
      <div
        style={{
          opacity: edit ? 1 : 0.6,
          pointerEvents: edit ? 'auto' : 'none'
        }}
      >
        <Field>
          <Label>Contraseña actual</Label>
          <Input
            type='password'
            placeholder='••••••••'
            value={form.pwCurrent}
            onChange={(e) =>
              setForm((f) => ({ ...f, pwCurrent: e.target.value }))
            }
          />
        </Field>
        <Field>
          <Label>Nueva contraseña</Label>
          <Input
            type='password'
            placeholder='••••••••'
            value={form.pwNext}
            onChange={(e) => setForm((f) => ({ ...f, pwNext: e.target.value }))}
          />
          {errors.password && <ErrorText>{errors.password}</ErrorText>}
          {pwMsg && <Muted>{pwMsg}</Muted>}
        </Field>
        <Muted>
          Deja los campos vacíos si no quieres cambiar tu contraseña.
        </Muted>
      </div>

      <Row>
        {!edit ? (
          <Button type='button' onClick={() => setEdit(true)}>
            Editar
          </Button>
        ) : (
          <>
            <Button type='button' onClick={save} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
            <GhostButton
              type='button'
              onClick={() => {
                setForm({
                  name: user?.name || '',
                  email: user?.email || '',
                  description: user?.description || '',
                  pwCurrent: '',
                  pwNext: ''
                })
                setErrors({})
                setPwMsg('')
                setEdit(false)
              }}
            >
              Cancelar
            </GhostButton>
          </>
        )}
      </Row>
    </Card>
  )
}
