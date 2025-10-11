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
// paginador generico con prev/next
export default function Pager({
  // props
  page,
  pages = [],
  totalPages,
  onPrev,
  onNext,
  onGoto
}) {
  return (
    // accesible aria label y aria current
    // sin state, recibo handlers onPrev,OnNext,OnGoto, para cambiar pagina
    <PagerWrap aria-label='Paginación'>
      <PageBtn
        onClick={onPrev}
        disabled={page === 1}
        aria-label='Página anterior'
      >
        {/* aria label, nombre accesible a un elemento para lectores de pantalla
        desrcibe que hace cuando el texto visible no es suficiente
        no cambia estado, solo nombra, en este caso no nos explica nada, solo dice: pagina ant */}
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
            {/* aria current: marca de estado para indicar el elemento actual dentro de un conjunto
            valores utiles: "page" pagina actual, "step", "location""date""time""true/false" */}
            {/* no pone nombre, marca cual esta activo / seleccionado */}

            {/* current : este es el actual dentro de un grupo/ label: como se llama donde ataca */}
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
