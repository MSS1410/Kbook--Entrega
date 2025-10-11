import React from 'react'
import Modal from '../../../components/Modal'

export default function CreateAuthorModal({
  open,
  onClose, // control visibilidad
  creating,
  setCreating, // modelo controlado creacion
  file,
  setFile, // archivo y setter
  previewUrl,
  setPreviewUrl, // objeto url y setter
  saving,
  onSave
}) {
  return (
    <Modal
      open={open}
      title='Añadir autor'
      onClose={onClose}
      footer={
        <>
          <button
            className='btn-ghost'
            onClick={onClose}
            style={{ marginRight: 8 }}
          >
            Cancelar
          </button>
          <button disabled={saving} onClick={onSave}>
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      <div
        style={{
          display: 'grid',
          gap: 12,
          maxHeight: '60vh',
          overflow: 'auto'
        }}
      >
        <label>
          Nombre *
          <input
            value={creating.name}
            onChange={(e) =>
              setCreating((s) => ({ ...s, name: e.target.value }))
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
          Biografía
          <textarea
            rows={4}
            value={creating.biography}
            onChange={(e) =>
              setCreating((s) => ({ ...s, biography: e.target.value }))
            }
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border,#E2E8F0)',
              borderRadius: 10
            }}
          />
        </label>

        <label>
          Foto (archivo)
          <input
            type='file'
            accept='image/*'
            onChange={(e) => {
              const f = e.target.files?.[0] || null
              setFile(f)
              if (previewUrl) {
                // evita leaks al cambiar archivo
                URL.revokeObjectURL(previewUrl)
                setPreviewUrl('')
              }
              if (f) setPreviewUrl(URL.createObjectURL(f)) // crea objectUrl para preview
            }}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid var(--border,#E2E8F0)',
              borderRadius: 10,
              background: '#fff'
            }}
          />
          {file && (
            <small style={{ color: '#64748b' }}>
              {file.name} • {(file.size / 1024).toFixed(1)} KB
            </small>
          )}
        </label>

        {previewUrl && (
          <div
            style={{
              width: 160,
              aspectRatio: '1/1',
              borderRadius: 12,
              overflow: 'hidden',
              background: '#eee'
            }}
          >
            <img
              src={previewUrl}
              alt='Previsualización'
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type='checkbox'
            checked={creating.featured}
            onChange={(e) =>
              setCreating((s) => ({ ...s, featured: e.target.checked }))
            }
          />
          Destacado
        </label>
      </div>
    </Modal>
  )
}
