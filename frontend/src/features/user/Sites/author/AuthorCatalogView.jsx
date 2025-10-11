import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const Wrap = styled.div`
  max-width: 1100px;
  margin: 2rem auto;
  padding: ${({ theme }) => theme.spacing.lg};
`

const H1 = styled.h1`
  margin: 0 0 12px;
  font-size: 1.4rem;
`

const ResultCount = styled.div`
  color: #666;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const Empty = styled.div`
  padding: 2rem 0;
  color: #666;
`

const AuthorCard = styled.article`
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 16px;
  padding: 16px;
  border: 1px solid #ececec;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  @media (max-width: 700px) {
    grid-template-columns: 120px 1fr;
  }
`
const LeftCol = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
`
const Avatar = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 10px;
  background: #f0f0f0;

  @media (max-width: 700px) {
    width: 100px;
    height: 100px;
  }
`
const Name = styled.h2`
  margin: 0;
  font-size: 1.1rem;
`
const Bio = styled.div`
  grid-column: 1 / -1;
  margin-top: 6px;
  color: #333;
  line-height: 1.5;
`

const BooksStripWrap = styled.div`
  grid-column: 1 / -1;
  margin-top: 10px;
`
const StripHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`
const StripTitle = styled.div`
  font-weight: 700;
`
const StripControls = styled.div`
  display: inline-flex;
  gap: 6px;
`
const ArrowBtn = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid #e6e6e8;
  background: #fff;
  cursor: pointer;
  &:hover {
    background: #f7f7fa;
  }
`
const StripRow = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 6px;

  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 8px;
  }
`
const BookCard = styled(Link)`
  flex: 0 0 auto;
  width: 92px;
  text-decoration: none;
  color: inherit;
  scroll-snap-align: start;
`
const Cover = styled.img`
  width: 92px;
  height: 122px;
  object-fit: cover;
  border-radius: 8px;
  background: #f0f0f0;
`
const BookTitle = styled.div`
  margin-top: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

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
// crea una lista de paginas con (...), cuando tiene mucha, usa paginador compacto con numeros.
function usePagination(page, totalPages, delta = 1) {
  return useMemo(() => {
    // use Memo para recalcular cuando cambian page, totalPages, delta
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    const range = [1]
    const left = Math.max(2, page - delta)
    const right = Math.min(totalPages - 1, page + delta)
    if (left > 2) range.push('…')
    for (let i = left; i <= right; i++) range.push(i)
    if (right < totalPages - 1) range.push('…')
    range.push(totalPages)
    return range
  }, [page, totalPages, delta])
}

// catalogo para autores, revibe un array de items autores ya preparados, lo smuesstra en tarjetas con un rail horizontal de libros x autor y pag inferior

export default function AuthorCatalogView({
  title = 'Autores',
  items = [],
  pageSize = 5
}) {
  const [page, setPage] = useState(1)
  // estado pagina
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  // calculo total de apginas. Si el num de paginas cambia, y la actual "salta", nos resetea en 1
  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages, page])

  // calculo ventana visible, ventana de authors a renderizar
  const start = (page - 1) * pageSize
  const visible = items.slice(start, start + pageSize)
  const pages = usePagination(page, totalPages, 1)

  return (
    <Wrap>
      <H1>{title}</H1>
      <ResultCount>
        {total} autor{total === 1 ? '' : 'es'} · Mostrando{' '}
        {Math.min(total, start + 1)}–{Math.min(total, start + visible.length)}
        {/* render de cada tarjeta autor */}
      </ResultCount>

      {!total && <Empty>Sin autores.</Empty>}

      {visible.map((a) => {
        // mapeo de autores en ventana visible
        const stripRef = useRef(null) // refLocal, por tarjeta, para scroll con botones
        // tira de libros del autor
        const scroll = (dx) => () => {
          // mapea books a mini-cards
          const el = stripRef.current
          if (!el) return
          el.scrollBy({ left: dx, behavior: 'smooth' })
        }

        return (
          // render card del author
          <AuthorCard key={a._id}>
            <LeftCol>
              <Avatar
                src={
                  a.photo || 'https://via.placeholder.com/240x240?text=Autor'
                }
                alt={a.name}
                onError={(e) =>
                  (e.currentTarget.src =
                    'https://via.placeholder.com/240x240?text=Autor')
                }
              />
              <div>
                <Name>{a.name}</Name>
              </div>
            </LeftCol>

            <div />

            <Bio>{a.biography || ' '}</Bio>

            <BooksStripWrap>
              {/* ocupa toda la fila, la tira se extiende en lo ancho de tarjeta */}
              <StripHeader>
                <StripTitle>Libros de {a.name}</StripTitle>
                {/* titulo de la tira */}
                <StripControls>
                  {/* controles de tira */}
                  <ArrowBtn onClick={scroll(-260)} aria-label='Anterior'>
                    ‹
                  </ArrowBtn>
                  <ArrowBtn onClick={scroll(+260)} aria-label='Siguiente'>
                    ›
                  </ArrowBtn>
                </StripControls>
              </StripHeader>

              <StripRow ref={stripRef}>
                {/* strio ref = useReff null, crea scroll programatico */}
                {/* stripRow, fila de libros del autor. */}
                {(a.books || []).map((b) => (
                  <BookCard key={b._id} to={`/books/${b._id}`}>
                    <Cover
                      src={
                        b.coverImage ||
                        'https://via.placeholder.com/92x122?text=Portada'
                      }
                      alt={b.title}
                      onError={(e) =>
                        (e.currentTarget.src =
                          'https://via.placeholder.com/92x122?text=Portada')
                      }
                    />
                    <BookTitle title={b.title}>{b.title}</BookTitle>
                  </BookCard>
                ))}
              </StripRow>
            </BooksStripWrap>
          </AuthorCard>
        )
      })}

      {totalPages > 1 && (
        <PagerWrap aria-label='Paginación'>
          <PageBtn
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label='Página anterior'
          >
            ‹
          </PageBtn>
          {pages.map((p, i) =>
            p === '…' ? (
              <PageEllipsis key={`e-${i}`}>…</PageEllipsis>
            ) : (
              <PageBtn
                key={p}
                active={p === page}
                aria-current={p === page ? 'page' : undefined}
                onClick={() => setPage(p)}
              >
                {p}
              </PageBtn>
            )
          )}
          <PageBtn
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label='Página siguiente'
          >
            ›
          </PageBtn>
        </PagerWrap>
      )}
    </Wrap>
  )
}
