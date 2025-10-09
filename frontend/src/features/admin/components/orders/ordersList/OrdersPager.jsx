// frontend/src/admin/pages/orders/OrdersPager.jsx
import React from 'react'
import styled from 'styled-components'
import Button from '../../Button.jsx'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const Pager = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
`

export default function OrdersPager({ page, totalPages, onPrev, onNext }) {
  return (
    <Pager>
      <Button onClick={onPrev} disabled={page <= 1}>
        <ChevronLeft size={16} /> Anterior
      </Button>
      <div>
        {' '}
        Página {page} de {totalPages}{' '}
      </div>
      <Button onClick={onNext} disabled={page >= totalPages}>
        Siguiente <ChevronRight size={16} />
      </Button>
    </Pager>
  )
}
