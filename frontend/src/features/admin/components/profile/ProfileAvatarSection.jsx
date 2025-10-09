import React from 'react'
import styled from 'styled-components'
import { Upload } from 'lucide-react'
import { absUrl } from '../../../../utils/absUrl'

// placeholder 1x1 transparente (seguro)
import { AVATAR_PLACEHOLDER } from '../../../../constants/media'

const Card = styled.div`
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: linear-gradient(180deg, #fafafa, #f3f5f9);
  padding: 16px;
  display: grid;
  gap: 12px;
`
const SectionTitle = styled.h3`
  margin: 0 0 6px 0;
  font-size: 18px;
`
const AvatarShell = styled.div`
  display: grid;
  place-items: center;
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

export default function ProfileAvatarSection({
  editing,
  name,
  avatarUrl,
  previewUrl,
  onPickAvatar
}) {
  const src =
    previewUrl || (avatarUrl ? absUrl(avatarUrl) : '') || AVATAR_PLACEHOLDER

  return (
    <Card>
      <SectionTitle>Foto de perfil</SectionTitle>
      <AvatarShell>
        <AvatarBox>
          <img src={src} alt={name || 'Avatar'} />
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
          <Muted>JPG/PNG/WebP. Se guardará al pulsar “Guardar”.</Muted>
        </div>
      </div>
    </Card>
  )
}
