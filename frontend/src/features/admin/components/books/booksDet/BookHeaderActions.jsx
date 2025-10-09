import React from 'react'
import Button from '../../Button'
import { Pencil, Save, X, Trash2 } from 'lucide-react'

export default function BookHeaderActions({
  editing,
  saving,
  onEdit,
  onSave,
  onCancel,
  onDelete
}) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
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
