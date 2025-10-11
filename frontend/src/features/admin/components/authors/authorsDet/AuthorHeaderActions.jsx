import React from 'react'
import Button from '../../Button.jsx'
import { Pencil, Save, X, Trash2, Star } from 'lucide-react'

export default function AuthorHeaderActions({
  editing,
  saving, //estao UI
  featured,
  onToggleFeatured,
  onEdit,
  onSave,
  onCancel,
  onDelete // DE Featureed a delete, callbacks levantados en el padre
}) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button $variant='ghost' onClick={onToggleFeatured}>
        {/* toggle, texto */}
        <Star size={16} /> {featured ? 'Quitar destacado' : 'Marcar destacado'}
      </Button>
      {editing ? (
        <>
          <Button disabled={saving} onClick={onSave}>
            <Save size={16} /> {saving ? 'Guardando…' : 'Guardar'}
          </Button>
          <Button $variant='ghost' onClick={onCancel}>
            <X size={16} /> Cancelar
          </Button>
        </>
      ) : (
        <>
          <Button $variant='ghost' onClick={onEdit}>
            <Pencil size={16} /> Editar
          </Button>
          <Button $variant='danger' onClick={onDelete}>
            <Trash2 size={16} /> Eliminar
          </Button>
        </>
      )}
    </div>
  )
}
