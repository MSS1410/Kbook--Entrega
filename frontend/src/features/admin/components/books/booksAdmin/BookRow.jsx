import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import Button from '../../Button.jsx'
import { Eye, Trash2, Image as ImageIcon } from 'lucide-react'

const Row = styled.div`
  display: grid;
  gap: 12px;
  align-items: center;
  grid-template-columns: 72px 1fr auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  padding: 8px;
`
const RowMeta = styled.div`
  display: grid;
  gap: 4px;
  .syn {
    color: ${({ theme }) => theme.colors.mutedText};
    font-size: 13px;
  }
`

export default function BookRow({ b, onDelete }) {
  return (
    <Row>
      <div
        style={{
          width: 72,
          height: 96,
          borderRadius: 8,
          overflow: 'hidden',
          background: '#eee',
          position: 'relative'
        }}
      >
        {b.coverImage ? (
          <img
            src={b.coverImage}
            alt={b.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              color: '#94a3b8',
              fontSize: 12
            }}
          >
            <ImageIcon size={18} />
          </div>
        )}
      </div>
      <RowMeta>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <strong style={{ fontSize: 16 }}>{b.title}</strong>
          <span style={{ color: '#64748b' }}>{b.category}</span>
        </div>
        <div className='syn'>
          {b.synopsis?.slice(0, 160) || '—'}
          {/* sinopsis truncadqa con elipsis */}
          {(b.synopsis || '').length > 160 ? '…' : ''}
        </div>
      </RowMeta>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button as={Link} $variant='ghost' to={`/admin/books/${b._id}`}>
          <Eye size={16} /> Ver detalle
        </Button>
        <Button $variant='danger' onClick={() => onDelete(b._id)}>
          <Trash2 size={16} /> Eliminar
        </Button>
      </div>
    </Row>
  )
}
