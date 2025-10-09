import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import Button from '../components/Button.jsx'
import useAuth from '../../../hooks/useAuth.jsx'
import { updateUserAdmin } from '../api/adminApi.js'
import api from '../../../api/index.js'
import { uploadUserAvatar } from '../../../api/adminUpload.js'
import { Pencil, Save, X } from 'lucide-react'

// Secciones
import ProfileAvatarSection from '../components/profile/ProfileAvatarSection.jsx'
import ProfileDetailsSection from '../components/profile/ProfileDetailsSection.jsx'
import ProfileActivitySection from '../components/profile/ProfileActivitySection.jsx'

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

      // 3) Cambiar contraseña si procede
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
      {/* Header */}
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
            <Button onClick={saveProfile} disabled={saving || pwSaving}>
              <Save size={16} /> {saving ? 'Guardando…' : 'Guardar'}
            </Button>
            <Button $variant='ghost' onClick={cancelEdit}>
              <X size={16} /> Cancelar
            </Button>
          </div>
        )}
      </div>

      {/* Contenido */}
      <Top>
        <ProfileAvatarSection
          editing={editing}
          name={current.name}
          avatarUrl={current.avatar}
          previewUrl={newAvatarPreview}
          onPickAvatar={onPickAvatar}
        />

        <ProfileDetailsSection
          editing={editing}
          current={current}
          form={form}
          onChangeForm={onChangeForm}
          pw={pw}
          onChangePw={onChangePw}
          showCurrent={showCurrent}
          showNext={showNext}
          setShowCurrent={setShowCurrent}
          setShowNext={setShowNext}
          pwMsg={pwMsg}
        />
      </Top>

      <ProfileActivitySection lastLogin={current.lastLogin} />
    </Wrap>
  )
}
