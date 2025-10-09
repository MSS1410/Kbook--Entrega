import React from 'react'
import styled from 'styled-components'

const PagerWrap = styled.nav`
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 20px;
  flex-wrap: wrap;
`
const PageBtn = styled.button`
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid #e6e6e8;
  background: ${({ active }) => (active ? '#111' : '#fff')};
  color: ${({ active }) => (active ? '#fff' : '#333')};
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: ${({ active }) => (active ? '#111' : '#f6f6fa')};
  }
`
const PageEllipsis = styled.span`
  min-width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  color: #888;
`

export default function Pager({
  page,
  pages = [],
  totalPages,
  onPrev,
  onNext,
  onGoto
}) {
  return (
    <PagerWrap aria-label='Paginación'>
      <PageBtn
        onClick={onPrev}
        disabled={page === 1}
        aria-label='Página anterior'
      >
        ‹
      </PageBtn>

      {pages.map((p, idx) =>
        p === '…' ? (
          <PageEllipsis key={`e-${idx}`}>…</PageEllipsis>
        ) : (
          <PageBtn
            key={p}
            active={p === page}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onGoto(p)}
          >
            {p}
          </PageBtn>
        )
      )}

      <PageBtn
        onClick={onNext}
        disabled={page === totalPages}
        aria-label='Página siguiente'
      >
        ›
      </PageBtn>
    </PagerWrap>
  )
}
