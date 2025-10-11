import React, { useRef, useState } from 'react'
import styled from 'styled-components'
import useAuth from '../../hooks/useAuth'
import api from '../../api'
import { AVATAR_PLACEHOLDER, avatarSrc } from '../../constants/media'

const Wrap = styled.div`
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 16px;
  align-items: center;
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`
const Avatar = styled.img`
  width: 160px;
  height: 160px;
  border-radius: 999px;
  object-fit: cover;
  background: #f0f0f0;
`
const BtnRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`
const Button = styled.button`
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  &:disabled {
    opacity: 0.6;
  }
`
const Ghost = styled.button`
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary};
`
const HiddenFile = styled.input`
  display: none;
`
const Note = styled.p`
  margin: 8px 0 0;
  color: #666;
  font-size: 12px;
`
// sube o elimina avatar user
export default function AvatarUploader({ maxMB = 10 }) {
  const { user, setUser } = useAuth()
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const pick = () => fileRef.current?.click()
  //  onFile →->FormData -> POST /api/users/profile/avatar -> actualiza setUser.
  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const maxBytes = maxMB * 1024 * 1024
    if (file.size > maxBytes) {
      alert(`El archivo supera el límite de ${maxMB} MB.`)
      e.target.value = ''
      return
    }

    const fd = new FormData()
    fd.append('file', file) // <- el middlware espera 'file'

    setUploading(true)
    try {
      const { data } = await api.post('/api/users/profile/avatar', fd)
      if (data?.user) setUser(data.user)
      else if (data?.avatar) setUser((u) => ({ ...u, avatar: data.avatar }))

      window.dispatchEvent(new Event('profile:avatar-updated'))
    } catch (err) {
      console.warn('Avatar upload error:', err?.response?.data || err?.message)
      alert('Error subiendo avatar')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  // remove -> DELETE /api/users/profile/avatar -> limpia avatar y emite evento profile:avatar-updated.
  const remove = async () => {
    if (!confirm('¿Quitar foto de perfil?')) return
    try {
      const { data } = await api.delete('/api/users/profile/avatar')
      if (data?.user) setUser(data.user)
      else setUser((u) => ({ ...u, avatar: '' }))
      window.dispatchEvent(new Event('profile:avatar-updated'))
    } catch (err) {
      console.warn('Avatar delete error:', err?.response?.data || err?.message)
      alert('No se pudo quitar el avatar')
    }
  }

  const src = avatarSrc(user?.avatar)

  return (
    <Wrap>
      <Avatar
        // vista previa, botones cambiar, quitar foto
        src={src}
        alt={user?.name || 'Avatar'}
        onError={(e) => {
          if (e.currentTarget.src !== AVATAR_PLACEHOLDER) {
            e.currentTarget.src = AVATAR_PLACEHOLDER
          }
        }}
      />
      <div>
        <BtnRow>
          {/* button que da acceso a los ficheros */}
          <Button type='button' onClick={pick} disabled={uploading}>
            {uploading ? 'Subiendo…' : 'Cambiar foto'}
          </Button>
          {/* habilitado para eliminar img */}
          {user?.avatar && (
            <Ghost type='button' onClick={remove} disabled={uploading}>
              Quitar foto
            </Ghost>
          )}
        </BtnRow>
        <HiddenFile
          // input que abre el selector de archivos, oculto porque usamos boton "cambiar foto"
          // HiddenFile: es un input type file con display: non; lo ocultas para no mostrar el input nativo feo
          ref={fileRef} // se guarda referencia del input para poder disparar click desde buton custom
          type='file'
          accept='image/*'
          onChange={onFile}
        />
        <Note>Formato JPG/PNG/WEBP. Tamaño máximo {maxMB} MB.</Note>
        {/* instrucciones de reglaje */}
      </div>
    </Wrap>
  )
}
