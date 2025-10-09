import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import Button from '../../Button.jsx'
import { Eye, Trash2 } from 'lucide-react'

const Row = styled.div`
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  padding: 8px;
  overflow: hidden;
`
const Bio = styled.div`
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 13px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

export default function AuthorRow({ a, onDelete }) {
  return (
    <Row>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 8,
          overflow: 'hidden',
          background: '#eee'
        }}
      >
        {a.photo ? (
          <img
            src={a.photo}
            alt={a.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : null}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 16 }}>{a.name}</div>
        {!!a.biography && <Bio>{a.biography}</Bio>}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button as={Link} $variant='ghost' to={`/admin/authors/${a._id}`}>
          <Eye size={16} /> Ver detalle
        </Button>
        <Button $variant='danger' onClick={() => onDelete(a._id)}>
          <Trash2 size={16} /> Eliminar
        </Button>
      </div>
    </Row>
  )
}
