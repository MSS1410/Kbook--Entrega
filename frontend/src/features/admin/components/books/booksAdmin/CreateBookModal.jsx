import React, { useEffect } from 'react'
import Modal from '../../Modal.jsx'
import Button from '../../Button.jsx'
import styled from 'styled-components'
import { AlertTriangle } from 'lucide-react'

const Note = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.mutedSurface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
`
const PreviewBox = styled.div`
  border: 1px dashed ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: 12px;
  padding: 8px;
  display: grid;
  place-items: center;
  max-height: 260px;
  overflow: auto;
  img {
    max-width: 100%;
    max-height: 240px;
    display: block;
    object-fit: contain;
  }
`

export default function CreateBookModal({
  open, // visibilidad del modal
  onClose, // calback para cerrar
  creating, // estado local del formulario
  setCreating, // setter actualiza los campos
  coverFile, // portada seleccionada
  setCoverFile, // setter del file
  coverPreview,
  setCoverPreview,
  savingCreate, // flag guardado en curso
  onSave,
  authors, // autores dispo
  AuthorComboComp, // ccomponente comboBox ya en autor
  categoriesEnum // selec categoria permitida
}) {
  useEffect(
    () => () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview)
      // libra memoria del objectUrl cuando el modal se desmonta
    },
    [coverPreview]
  )

  return (
    <Modal
      open={open}
      title='Añadir libro'
      onClose={() => {
        onClose()
        if (coverPreview) URL.revokeObjectURL(coverPreview)
        setCoverPreview('')
        setCoverFile(null)
      }}
      footer={
        <>
          <Button
            $variant='ghost'
            onClick={() => {
              onClose()
              if (coverPreview) URL.revokeObjectURL(coverPreview)
              setCoverPreview('')
              setCoverFile(null)
            }}
          >
            Cancelar
          </Button>
          <Button disabled={savingCreate || !creating.author} onClick={onSave}>
            {savingCreate ? 'Guardando…' : 'Guardar'}
          </Button>
        </>
      }
    >
      <div
        style={{
          display: 'grid',
          gap: 12,
          maxHeight: '65vh',
          overflowY: 'auto'
        }}
      >
        {/* obligamos al admin a tener el autor reglado para que al añadir un libro no me quede colgado sin autor. */}
        {!authors.length && (
          <Note>
            <AlertTriangle size={18} /> No hay autores. Primero añádelo en{' '}
            <a
              href='/admin/authors'
              style={{ textDecoration: 'underline', marginLeft: 4 }}
            >
              Autores
            </a>
            .
          </Note>
        )}

        <label>
          Título *
          <input
            value={creating.title}
            onChange={(e) =>
              setCreating((s) => ({ ...s, title: e.target.value }))
            }
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border,#E2E8F0)',
              borderRadius: 10
            }}
          />
        </label>

        {/* author con buscador para correcta eleccion */}
        {AuthorComboComp}

        <label>
          {/* sect category */}
          Categoría *
          <select
            value={creating.category}
            onChange={(e) =>
              setCreating((s) => ({ ...s, category: e.target.value }))
            }
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid var(--border,#E2E8F0)',
              borderRadius: 10
            }}
          >
            {/* selector de categoria */}
            <option value=''>Selecciona categoría…</option>
            {categoriesEnum.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          {/* sect descri libro sinopsis */}
          Sinopsis *
          <textarea
            rows={4}
            value={creating.synopsis}
            onChange={(e) =>
              setCreating((s) => ({ ...s, synopsis: e.target.value }))
            }
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border,#E2E8F0)',
              borderRadius: 10
            }}
          />
        </label>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
            gap: 8
          }}
        >
          {/* marca de precio segun la tapa del libro */}
          <label>
            Precio blanda (€) *
            <input
              type='number'
              step='0.01'
              value={creating.priceSoft}
              onChange={(e) =>
                setCreating((s) => ({ ...s, priceSoft: e.target.value }))
              }
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border,#E2E8F0)',
                borderRadius: 10
              }}
            />
          </label>
          <label>
            Precio dura (€) *
            <input
              type='number'
              step='0.01'
              value={creating.priceHard}
              onChange={(e) =>
                setCreating((s) => ({ ...s, priceHard: e.target.value }))
              }
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border,#E2E8F0)',
                borderRadius: 10
              }}
            />
          </label>
          <label>
            Precio eBook (€) *
            <input
              type='number'
              step='0.1'
              value={creating.priceEbook}
              onChange={(e) =>
                setCreating((s) => ({ ...s, priceEbook: e.target.value }))
              }
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border,#E2E8F0)',
                borderRadius: 10
              }}
            />
          </label>
        </div>
        {/* seccion para portada cover Book */}
        <div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            O sube un archivo de portada
          </div>
          <input
            type='file'
            accept='image/*'
            onChange={(e) => {
              const file = e.target.files?.[0] || null
              setCoverFile(file)
              if (coverPreview) URL.revokeObjectURL(coverPreview)
              setCoverPreview(file ? URL.createObjectURL(file) : '')
            }}
          />
          {(coverPreview || creating.coverImage) && (
            <>
              {/* previsualizar portada en modal OK */}
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                Vista previa
              </div>
              <PreviewBox>
                <img src={coverPreview || creating.coverImage} alt='Portada' />
              </PreviewBox>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                * Si eliges archivo, tendrá prioridad sobre la URL al guardar.
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
