// components/ReviewsPager.jsx
import React from 'react'
import styled from 'styled-components'

const Pager = styled.div`
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: center;
  margin-top: 4px;
  flex-wrap: wrap;
`
const PageBtn = styled.button`
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : '#fff'};
  color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.onSurface)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`

export default function ReviewsPager({
  page,
  totalPages,
  onPrev,
  onNext,
  onGoto
}) {
  return (
    <Pager>
      <PageBtn onClick={onPrev} disabled={page <= 1}>
        ‹ Anterior
      </PageBtn>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <PageBtn key={n} $active={n === page} onClick={() => onGoto(n)}>
          {n}
        </PageBtn>
      ))}

      <PageBtn onClick={onNext} disabled={page >= totalPages}>
        Siguiente ›
      </PageBtn>
    </Pager>
  )
}
