import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import Button from '../components/Button.jsx'
import useAuth from '../../../hooks/useAuth.jsx'
import { updateUserAdmin } from '../api/adminApi.js' // API para actualizar datos basic admin
import api from '../../../api/index.js'
import { uploadUserAvatar } from '../../../api/adminUpload.js'
import { Pencil, Save, X } from 'lucide-react'

// componentes pagina
import ProfileAvatarSection from '../components/profile/ProfileAvatarSection.jsx'
import ProfileDetailsSection from '../components/profile/ProfileDetailsSection.jsx'
import ProfileActivitySection from '../components/profile/ProfileActivitySection.jsx'

/*  UI  */
const Wrap = styled.div`
  display: grid;
  gap: 16px;
`
const Top = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr);
  @media (min-width: 960px) {
    grid-template-columns: 360px minmax(0, 1fr); /* ← avatar a la izquierda, detalles a la derecha */
  }
`

/*  Page  */
export default function AdminProfile() {
  const { user } = useAuth() || {} //  prefiero datos de contexto
  const [adminId, setAdminId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  // estado con datos antiguos que pasaran si  no hay edicion
  const [current, setCurrent] = useState({
    name: '',
    email: '',
    avatar: '',
    description: '',
    lastLogin: ''
  })

  // formulario con edit
  const [form, setForm] = useState({ name: '', email: '', description: '' })

  // cambio de pwrd
  const [pw, setPw] = useState({ current: '', next: '' })
  const [showCurrent, setShowCurrent] = useState(false) //ojos
  const [showNext, setShowNext] = useState(false)

  // avatar upload
  const [newAvatar, setNewAvatar] = useState(null)
  const [newAvatarPreview, setNewAvatarPreview] = useState('')

  const [saving, setSaving] = useState(false) // guardados principales / perfil
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState('')

  //normalizo respuesta de bckend  /api/users/profile
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
    //  hidratar  estado de la pantalla con un user listo
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
      //contexto trae usuario, evitamos llamadas
      fill({
        id: String(user._id),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        description: user.description,
        lastLogin: user.lastLogin
      })
    } else {
      // fallback en   /api/users/profile para conocer al admin actual
      ;(async () => {
        try {
          const { data } = await api.get('/api/users/profile')
          const u = unwrapUser(data) //normalized
          fill(u)
        } catch {
          setLoading(false)
        }
      })()
    }
  }, [user?._id])

  // handler para input file (vatar
  const onPickAvatar = (e) => {
    const f = e.target.files?.[0]
    setNewAvatar(f || null)
    // liberamos preview previo
    if (newAvatarPreview) URL.revokeObjectURL(newAvatarPreview)
    // preview local instant
    setNewAvatarPreview(f ? URL.createObjectURL(f) : '')
  }

  //  cambios del form y del password
  const onChangeForm = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))
  const onChangePw = (k) => (e) => setPw((p) => ({ ...p, [k]: e.target.value }))

  // true si ambos campos de pass tienen contenido , condicion para pasar patch
  const wantsPwChange = useMemo(
    () => pw.current.trim() && pw.next.trim(),
    [pw.current, pw.next]
  )

  const startEdit = () => {
    setEditing(true)
    //limpiamos feedback previo
    setPwMsg('')
  }

  const cancelEdit = () => {
    // formulario a current. nivel visual
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
      // 1 Subir avatar si el usuario ok select file
      if (newAvatar) {
        try {
          const { avatar, url, path } = await uploadUserAvatar(
            adminId,
            newAvatar
          )
          const nextUrl = avatar || url || path || ''
          if (nextUrl) setCurrent((c) => ({ ...c, avatar: nextUrl }))
        } catch (e) {
          console.warn('Endpoint de avatar no areglado', e) // evito vloquear resto de actualizado
        }
      }

      // 2 Actualizar basik (name/email/description) SOLO onChange
      const basicsChanged =
        form.name.trim() !== current.name.trim() ||
        form.email.trim() !== current.email.trim() ||
        form.description.trim() !== (current.description || '').trim()

      if (basicsChanged) {
        await updateUserAdmin(adminId, {
          // PATCH admin
          name: form.name.trim(),
          email: form.email.trim(),
          description: form.description.trim()
        })
        setCurrent((c) => ({
          // syncro current
          ...c,
          name: form.name.trim(),
          email: form.email.trim(),
          description: form.description.trim()
        }))
      }

      // 3 Cambio pwrd
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
            // prueba por error repentino // "RETOCAR PARA FINAL"

            await api.patch(
              '/api/auth/change-password',
              { currentPassword: pw.current, newPassword: pw.next },
              { headers: { 'Content-Type': 'application/json' } }
            )
            setPwMsg('Contraseña actualizada.')
          }
          setPw({ current: '', next: '' }) // Limpieza de campos
        } catch {
          setPwMsg('No se pudo cambiar la contraseña.')
        } finally {
          setPwSaving(false)
        }
      }

      alert('Perfil actualizado')
      // reset form i previews
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
      {/* Header pg */}
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
          // Activa edit
          <Button onClick={startEdit}>
            <Pencil size={16} /> Editar
          </Button>
        ) : (
          // guardar cancelar durante edicion
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

      {/* AVATAR + DETALLES */}
      {/* PRINCIPAL */}
      <Top>
        <ProfileAvatarSection
          editing={editing} // bloqueo de subida si edito
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
          // ok change pwrd
          pwMsg={pwMsg}
        />
      </Top>

      {/* section guarda ultima entrada de admin, 
      La idea seria recojer un historial de acciones, tanto del usuario como del admin, y poder ver en admin,las de uuser y las propias. 
      Ademas habilitar el historial a user, avisar cuando se le esta revisando. Ahora solo vista*/}
      <ProfileActivitySection lastLogin={current.lastLogin} />
    </Wrap>
  )
}
