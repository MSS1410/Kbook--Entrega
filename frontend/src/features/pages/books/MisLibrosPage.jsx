// frontend/src/features/mybooks/MyBooksPage.jsx
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { getMyBooks } from '../../../api/users'
import ReviewForm from '../../../components/review/ReviewForm'

const Container = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  padding: ${({ theme }) => theme.spacing.lg};
`

const Title = styled.h2`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  /* columnas fijas y consistentes: entre 220 y 260px */
  grid-template-columns: repeat(auto-fill, minmax(220px, 260px));
  justify-content: start; /* no expandir para llenar todo el ancho */
  align-items: stretch;
`

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.onSurfaceVariant};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${({ theme }) => theme.colors.surface};
  width: 100%; /* ocupa el ancho del grid slot (máx. ~260px) */
`

const BookTitle = styled.div`
  font-weight: 700;
  text-align: center;
  line-height: 1.25;
  /* reservamos altura de 2 líneas para que todas queden iguales */
  min-height: calc(1.25em * 2);
  display: -webkit-box;
  -webkit-line-clamp: 2; /* máximo 2 líneas */
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const CoverWrap = styled.div`
  margin-top: 8px;
  width: 100%;
  aspect-ratio: 3 / 4; /* todas las imágenes misma altura */
  border-radius: 8px;
  overflow: hidden;
  background: #f1f1f1; /* color de fondo mientras carga */
`

const CoverImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`

/* Empuja el footer al fondo, dejando el espacio flexible arriba */
const Spacer = styled.div`
  flex: 1 1 auto;
`

const Actions = styled.div`
  margin-top: 12px;
  display: grid;
  gap: 8px;
`

const LinkBtn = styled(Link)`
  display: inline-block;
  text-align: center;
  text-decoration: none;
  border: 1px solid ${({ theme }) => theme.colors.onSurfaceVariant};
  color: ${({ theme }) => theme.colors.onSurface};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: transform 0.06s ease;
  &:active {
    transform: translateY(1px);
  }
`

const PrimaryBtn = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border: none;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  transition: transform 0.06s ease;
  &:active {
    transform: translateY(1px);
  }
`

// Normaliza posibles nombres de campo desde el backend
const resolveCover = (b) =>
  b?.coverImage || b?.cover || b?.coverImageUrl || b?.image || ''

export default function MyBooksPage() {
  const [books, setBooks] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const { data } = await getMyBooks()
        const arr = Array.isArray(data?.books) ? data.books : []
        setBooks(arr)
      } catch (err) {
        console.error('Error cargando mis libros', err)
        setError('No pudimos cargar tus libros.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <Container>
      <Title>Mi Librería</Title>

      {loading && <p>Cargando…</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {!loading && !error && !books.length && (
        <p>Aquí aparecerán los libros que compraste.</p>
      )}

      <Grid>
        {books.map((b) => {
          const src = resolveCover(b)
          return (
            <Card key={b._id}>
              <BookTitle title={b.title}>{b.title}</BookTitle>

              <CoverWrap>
                <CoverImg
                  src={src || '/placeholder-cover.png'}
                  alt={b.title}
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-cover.png'
                  }}
                />
              </CoverWrap>

              <Spacer />

              <Actions>
                <LinkBtn to={`/books/${b._id}`}>Ver detalle</LinkBtn>
                <PrimaryBtn onClick={() => setSelected(b)}>
                  Deja tu huella Kbook
                </PrimaryBtn>
              </Actions>
            </Card>
          )
        })}
      </Grid>

      {selected && (
        <ReviewForm
          book={selected}
          onClose={() => setSelected(null)}
          prefill={{}}
        />
      )}
    </Container>
  )
}
