import React from 'react'
import styled from 'styled-components'

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  overflow: hidden;
`
const Avatar = styled.div`
  position: relative;
  width: 100%;
  background: #eee;
  &::before {
    content: '';
    display: block;
    padding-bottom: 100%;
  }
  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

export default function AuthorAvatarUploader({
  editing,
  author,
  previewUrl,
  newPhotoFile,
  setNewPhotoFile,
  setPreviewUrl
}) {
  return (
    <Card>
      <Avatar>
        {(previewUrl || author.photo) && (
          <img src={previewUrl || author.photo} alt={author.name} />
        )}
      </Avatar>

      {editing && (
        <div
          style={{ padding: 12, borderTop: '1px solid var(--border,#E2E8F0)' }}
        >
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ color: 'var(--primary,#0ea5e9)', fontWeight: 700 }}>
              Nueva foto (archivo)
            </span>
            <input
              type='file'
              accept='image/*'
              onChange={(e) => {
                const file = e.target.files?.[0] || null
                setNewPhotoFile(file)
                if (previewUrl) {
                  URL.revokeObjectURL(previewUrl)
                  setPreviewUrl('')
                }
                if (file) {
                  const url = URL.createObjectURL(file)
                  setPreviewUrl(url)
                }
              }}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--border,#E2E8F0)',
                borderRadius: 10,
                background: '#fff'
              }}
            />
            {newPhotoFile && (
              <small style={{ color: '#64748b' }}>
                {newPhotoFile.name} • {(newPhotoFile.size / 1024).toFixed(1)} KB
              </small>
            )}
          </label>
        </div>
      )}
    </Card>
  )
}
