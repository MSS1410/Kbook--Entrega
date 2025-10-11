import React from 'react'
import styled from 'styled-components'
import { absUrl } from '../../../../../utils/absUrl'

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  min-width: 0;
`
const Cover = styled.div`
  aspect-ratio: 3/4;
  background: #eee;
  border-radius: ${({ theme }) => theme.radii.lg}
    ${({ theme }) => theme.radii.lg} 0 0;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`
const Field = styled.label`
  display: grid;
  gap: 6px;
`
const FieldLabel = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
`

export default function BookCoverUploader({
  book, // Objeto libro a mostrar en portada actual
  editing, // si objeto esta en edicino, mostrar input file
  newCoverPreview, //
  onPickCover // handler : (e) setNewCoverField(file); setNewCoverPreview
}) {
  return (
    <Card>
      <Cover>
        {book.coverImage ? (
          <img src={absUrl(book.coverImage)} alt={book.title} />
        ) : null}
      </Cover>

      {editing && (
        <div
          style={{
            padding: 12,
            borderTop: '1px solid var(--border,#E2E8F0)',
            display: 'grid',
            gap: 10
          }}
        >
          <Field>
            <FieldLabel>Nueva portada (archivo)</FieldLabel>
            <input
              type='file'
              accept='image/*'
              onChange={onPickCover} // delega al contenedor para setear file y su previewww
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--border,#E2E8F0)',
                borderRadius: 10,
                background: '#fff'
              }}
            />
          </Field>
          {newCoverPreview ? (
            <div
              style={{ maxHeight: 240, overflow: 'hidden', borderRadius: 10 }}
            >
              <img
                src={newCoverPreview}
                alt='Vista previa'
                style={{ display: 'block', width: '100%', objectFit: 'cover' }}
              />
            </div>
          ) : null}
        </div>
      )}
    </Card>
  )
}
