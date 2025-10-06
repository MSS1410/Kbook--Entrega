// frontend/src/features/admin/pages/AdminProfile.jsx
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import Button from '../components/Button.jsx'
import useAuth from '../../../hooks/useAuth.jsx'
import { updateUserAdmin } from '../api/adminApi.js'
import api from '../../../api/index.js'
import { uploadUserAvatar } from '../../../api/adminUpload.js'
import { Eye, EyeOff, Upload, Pencil, Save, X } from 'lucide-react'

/* ======================= UI ======================= */
const Wrap = styled.div`
  display: grid;
  gap: 16px;
`
const Top = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr);
  @media (min-width: 960px) {
    grid-template-columns: 360px minmax(0, 1fr);
  }
`
const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  overflow: hidden;
`
const Block = styled(Card)`
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
const Row = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
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

/* Avatar bonito */
const AvatarShell = styled.div`
  display: grid;
  place-items: center;
  padding: 12px;
  border-radius: 16px;
  background: linear-gradient(180deg, #fafafa, #f3f5f9);
  border: 1px dashed ${({ theme }) => theme.colors.border};
`
const AvatarBox = styled.div`
  width: 168px;
  height: 168px;
  border-radius: 9999px;
  background: #e5e7eb;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08), inset 0 0 0 6px #fff;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`
const FileButton = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.mutedSurface};
  color: ${({ theme }) => theme.colors.text};
  padding: 10px 12px;
  border-radius: 10px;
  user-select: none;
  &:hover {
    filter: brightness(0.98);
  }
  input {
    display: none;
  }
`
const Muted = styled.small`
  color: #64748b;
`
const Bottom = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr);
`

/* ======================= Page ======================= */
export default function AdminProfile() {
  const { user } = useAuth() || {}
  const [adminId, setAdminId] = useState(null)
  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState(false)

  // datos actuales
  const [current, setCurrent] = useState({
    name: '',
    email: '',
    avatar: '',
    description: '',
    lastLogin: ''
  })

  // formulario (edición)
  const [form, setForm] = useState({ name: '', email: '', description: '' })

  // contraseña
  const [pw, setPw] = useState({ current: '', next: '' })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)

  // avatar por fichero
  const [newAvatar, setNewAvatar] = useState(null)
  const [newAvatarPreview, setNewAvatarPreview] = useState('')

  const [saving, setSaving] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState('')

  // Helper robusto para extraer el user del /api/users/profile
  const unwrapUser = (data) => {
    const u = data?.user || data?.profile || data
    if (!u || typeof u !== 'object') return null
    return {
      id: String(u._id || u.id || u.userId || '').trim() || null,
      name: u.name || '',
      email: u.email || '',
      avatar: u.avatar || '',
      description: u.description || '',
      lastLogin: u.lastLogin || ''
    }
  }

  useEffect(() => {
    let alive = true
    const fill = (u) => {
      setAdminId(u?.id || null)
      setCurrent({
        name: u?.name || '',
        email: u?.email || '',
        avatar: u?.avatar || '',
        description: u?.description || '',
        lastLogin: u?.lastLogin || ''
      })
      setForm({
        name: u?.name || '',
        email: u?.email || '',
        description: u?.description || ''
      })
      setLoading(false)
    }

    if (user?._id) {
      fill({
        id: String(user._id),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        description: user.description,
        lastLogin: user.lastLogin
      })
    } else {
      ;(async () => {
        try {
          const { data } = await api.get('/api/users/profile')
          const u = unwrapUser(data)
          fill(u)
        } catch {
          setLoading(false)
        }
      })()
    }
    return () => {
      alive = false
    }
  }, [user?._id])

  // avatar
  const onPickAvatar = (e) => {
    const f = e.target.files?.[0]
    setNewAvatar(f || null)
    if (newAvatarPreview) URL.revokeObjectURL(newAvatarPreview)
    setNewAvatarPreview(f ? URL.createObjectURL(f) : '')
  }

  const onChangeForm = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))
  const onChangePw = (k) => (e) => setPw((p) => ({ ...p, [k]: e.target.value }))
  const wantsPwChange = useMemo(
    () => pw.current.trim() && pw.next.trim(),
    [pw.current, pw.next]
  )

  const startEdit = () => {
    setEditing(true)
    setPwMsg('')
  }
  const cancelEdit = () => {
    setEditing(false)
    setForm({
      name: current.name,
      email: current.email,
      description: current.description
    })
    setPw({ current: '', next: '' })
    setPwMsg('')
    if (newAvatarPreview) URL.revokeObjectURL(newAvatarPreview)
    setNewAvatar(null)
    setNewAvatarPreview('')
  }

  const saveProfile = async () => {
    if (!adminId) {
      alert('No se pudo identificar tu usuario.')
      return
    }
    setSaving(true)
    try {
      // 1) Subir avatar si hay
      if (newAvatar) {
        try {
          const { avatar, url, path } = await uploadUserAvatar(
            adminId,
            newAvatar
          )
          const nextUrl = avatar || url || path || ''
          if (nextUrl) setCurrent((c) => ({ ...c, avatar: nextUrl }))
        } catch (e) {
          console.warn(
            'Endpoint de avatar no disponible; solo actualizo la UI.',
            e
          )
        }
      }

      // 2) Actualizar name/email/description
      const basicsChanged =
        form.name.trim() !== current.name.trim() ||
        form.email.trim() !== current.email.trim() ||
        form.description.trim() !== (current.description || '').trim()

      if (basicsChanged) {
        await updateUserAdmin(adminId, {
          name: form.name.trim(),
          email: form.email.trim(),
          description: form.description.trim()
        })
        setCurrent((c) => ({
          ...c,
          name: form.name.trim(),
          email: form.email.trim(),
          description: form.description.trim()
        }))
      }

      /// 3) Cambiar contraseña si procede
      if (wantsPwChange) {
        setPwSaving(true)
        try {
          try {
            await api.patch(
              '/api/users/me/password',
              { currentPassword: pw.current, newPassword: pw.next },
              { headers: { 'Content-Type': 'application/json' } }
            )
            setPwMsg('Contraseña actualizada.')
          } catch {
            await api.patch(
              '/api/auth/change-password',
              { currentPassword: pw.current, newPassword: pw.next },
              { headers: { 'Content-Type': 'application/json' } }
            )
            setPwMsg('Contraseña actualizada.')
          }
          setPw({ current: '', next: '' })
        } catch {
          setPwMsg('No se pudo cambiar la contraseña.')
        } finally {
          setPwSaving(false)
        }
      }

      alert('Perfil actualizado')
      cancelEdit()
    } catch (e) {
      console.error(e)
      alert('No se pudo guardar el perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Cargando…</div>

  return (
    <Wrap>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Mi perfil</h2>
          <small style={{ color: '#64748b' }}>
            Datos del administrador y actividad reciente
          </small>
        </div>
        {!editing ? (
          <Button onClick={startEdit}>
            <Pencil size={16} /> Editar
          </Button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            {/* 👉 Guardar siempre habilitado en edición (salvo mientras guarda) */}
            <Button onClick={saveProfile} disabled={saving || pwSaving}>
              <Save size={16} /> {saving ? 'Guardando…' : 'Guardar'}
            </Button>
            <Button $variant='ghost' onClick={cancelEdit}>
              <X size={16} /> Cancelar
            </Button>
          </div>
        )}
      </div>

      <Top>
        {/* Avatar */}
        <Block>
          <SectionTitle>Foto de perfil</SectionTitle>
          <AvatarShell>
            <AvatarBox>
              {newAvatarPreview || current.avatar ? (
                <img
                  src={newAvatarPreview || current.avatar}
                  alt={current.name || 'Avatar'}
                />
              ) : null}
            </AvatarBox>
          </AvatarShell>
          <div>
            <FileButton
              title='Seleccionar imagen'
              style={{
                opacity: editing ? 1 : 0.6,
                pointerEvents: editing ? 'auto' : 'none'
              }}
            >
              <Upload size={16} /> Subir imagen desde tu equipo
              <input type='file' accept='image/*' onChange={onPickAvatar} />
            </FileButton>
            <div style={{ marginTop: 6 }}>
              <Muted>JPG/PNG. Se guardará al pulsar “Guardar”.</Muted>
            </div>
          </div>
        </Block>

        {/* Datos */}
        <Block>
          <SectionTitle>Datos del administrador</SectionTitle>

          <Field>
            <Label>Nombre</Label>
            <Input
              disabled={!editing}
              placeholder={current.name || '—'}
              value={editing ? form.name : ''}
              onChange={onChangeForm('name')}
            />
          </Field>

          <Field>
            <Label>Email</Label>
            <Input
              type='email'
              disabled={!editing}
              placeholder={current.email || '—'}
              value={editing ? form.email : ''}
              onChange={onChangeForm('email')}
            />
          </Field>

          <div
            style={{
              display: 'grid',
              gap: 10,
              opacity: editing ? 1 : 0.6,
              pointerEvents: editing ? 'auto' : 'none'
            }}
          >
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
              value={editing ? form.description : ''}
              onChange={onChangeForm('description')}
            />
          </Field>
        </Block>
      </Top>

      <Bottom>
        <Block>
          <SectionTitle>Actividad reciente</SectionTitle>
          <div style={{ color: '#64748b', fontSize: 14 }}>
            Última conexión:{' '}
            {current.lastLogin
              ? new Date(current.lastLogin).toLocaleString()
              : '—'}
          </div>
          <div style={{ color: '#9CA3AF', fontSize: 13, marginTop: 6 }}>
            Historial de acciones (solo muestreo). Más adelante podemos
            habilitar un <em>audit log</em>.
          </div>
        </Block>
      </Bottom>
    </Wrap>
  )
}
