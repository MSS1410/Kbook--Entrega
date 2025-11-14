import React from 'react'
import styled from 'styled-components'

const Pager = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  button {
    padding: 8px 12px;
    border-radius: 10px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.cardBg};
  }
  strong {
    min-width: 80px;
    text-align: center;
  }
`

export default function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <Pager>
      <button disabled={page <= 1} onClick={onPrev}>
        Anterior
        {/* disabled si no puede haber anterior*/}
      </button>
      <strong>
        Página {page}/{totalPages}
      </strong>
      <button disabled={page >= totalPages} onClick={onNext}>
        {/* igual al inverso, proteje limites superiores */}
        Siguiente
      </button>
    </Pager>
  )
}
