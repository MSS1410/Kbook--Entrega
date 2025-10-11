import React from 'react'
import styled from 'styled-components'
import Button from '../../Button'
import { Trash2 } from 'lucide-react'

const TableWrap = styled.div`
  max-height: 420px;
  overflow: auto;
  border-radius: 10px;
`
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  th,
  td {
    padding: 10px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    text-align: left;
  }
  th {
    color: ${({ theme }) => theme.colors.mutedText};
    font-weight: 600;
    position: sticky;
    top: 0;
    background: ${({ theme }) => theme.colors.cardBg};
    z-index: 1;
  }
`

export default function ReviewsTable({ reviews, deletingIds, onDelete }) {
  return (
    <TableWrap>
      <Table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Libro</th>
            <th>Puntuación</th>
            <th>Comentario</th>
            <th style={{ width: 64, textAlign: 'right' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => {
            // estado por fila
            const isDeleting = deletingIds.has(r._id)
            return (
              <tr key={r._id}>
                <td>
                  {r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}
                </td>
                <td>
                  {typeof r.book === 'object'
                    ? r.book?.title || 'Libro'
                    : 'Libro'}
                </td>
                <td>{r.rating ?? '—'}</td>
                <td>{r.comment || '—'}</td>
                <td style={{ textAlign: 'right' }}>
                  <Button
                    $variant='ghost'
                    disabled={isDeleting}
                    onClick={() => onDelete(r)}
                    title='Eliminar reseña'
                  >
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </TableWrap>
  )
}
