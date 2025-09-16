// frontend/src/features/Books/BookSingularPage.jsx
import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'
import api from '../../api'
import HomeCarrusel from '../../components/HomeCarrusels'
import useCart from '../../hooks/useCart'
import useAuth from '../../hooks/useAuth'
import CarritoAside from '../../components/carritoAside'

// Container adaptativo y sin overflow
const Page = styled.div`
  display: flex;
  max-width: 1200px;
  margin: 2rem auto;
  gap: ${({ theme }) => theme.spacing.lg};
  overflow-x: hidden;
  @media (max-width: 992px) {
    flex-direction: column;
    padding: ${({ theme }) => theme.spacing.md};
    gap: ${({ theme }) => theme.spacing.md};
  }
`

// Sidebar ajustado
const Sidebar = styled.div`
  flex: 0 0 300px;
  position: sticky;
  top: 2rem;
  @media (max-width: 992px) {
    position: static;
    width: 100%;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`

const Cover = styled.img`
  width: 100%;
  height: auto;
  border-radius: ${({ theme }) => theme.radii.sm};
`

// Contenido principal
const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  width: 100%;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  overflow-x: hidden;
  @media (max-width: 992px) {
    padding: 0;
    gap: ${({ theme }) => theme.spacing.md};
  }
`

const Title = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  @media (max-width: 576px) {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }
`

const MetaList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.onSurface};
`

const MetaItem = styled.li`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  @media (max-width: 576px) {
    font-size: ${({ theme }) => theme.fontSizes.xs};
  }
`

// Grid de formatos adaptativo
const FormatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

const FormatCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.onSurfaceVariant};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  transition: box-shadow 0.2s;
  position: relative;
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`

const Price = styled.p`
  margin: 0;
  font-weight: bold;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  @media (max-width: 576px) {
    flex: 1 1 100%;
  }
`

const Section = styled.section`
  margin-top: ${({ theme }) => theme.spacing.xl};
  @media (max-width: 992px) {
    margin-top: ${({ theme }) => theme.spacing.md};
  }
`

export default function BookSingularPage() {
  const { id } = useParams()
  const theme = useTheme()
  const { token } = useAuth()
  const { addOrUpdate } = useCart()
  const [book, setBook] = useState(null)
  const [selected, setSelected] = useState(null)
  const [recs, setRecs] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data: b } = await api.get(`/api/books/${id}`)
        setBook(b)
        setSelected(b.formats?.[0] || null)
        const { data: others } = await api.get(
          `/api/books?category=${encodeURIComponent(b.category)}&limit=8`
        )
        const arr = Array.isArray(others) ? others : others.books || []
        setRecs(arr.filter((x) => x._id !== id))
      } catch (err) {
        console.error('Error cargando libro singular:', err)
      }
    }
    load()
  }, [id])

  if (!book) return <p>Cargando...</p>
  if (!selected) return <p>Seleccionando formato...</p>

  const addToCart = async () => {
    if (!token) {
      alert('Necesitas iniciar sesión para añadir al carrito')
      return
    }
    try {
      setAdding(true)
      await addOrUpdate({
        bookId: id,
        format: selected.type,
        quantity: 1
      })
      setShowCart(true)
    } catch (err) {
      console.error('Error al añadir al carrito:', err)
      alert(
        'Error añadiendo al carrito: ' +
          (err.response?.data?.message || err.message)
      )
    } finally {
      setAdding(false)
    }
  }

  return (
    <>
      <Page>
        <Sidebar>
          <Cover src={book.coverImage} alt={book.title} />
        </Sidebar>
        <Content>
          <Title>{book.title}</Title>
          <MetaList>
            <MetaItem>
              Autor:{' '}
              <Link to={`/authors/${book.author._id}`}>{book.author.name}</Link>
            </MetaItem>
            <MetaItem>Categoría: {book.category}</MetaItem>
          </MetaList>

          <Section>
            <h2>Formatos disponibles</h2>
            <FormatsGrid>
              {book.formats.map((f) => (
                <FormatCard
                  key={f.type}
                  onClick={() => setSelected(f)}
                  style={{
                    boxShadow:
                      selected?.type === f.type
                        ? `0 0 0 2px ${theme.colors.primary}`
                        : 'none'
                  }}
                  aria-label={`Seleccionar formato ${f.label}`}
                >
                  <span>{f.label}</span>
                  <Price>{f.price.toFixed(2)} €</Price>
                  <small>Stock: {f.stock}</small>
                </FormatCard>
              ))}
            </FormatsGrid>
          </Section>

          <ButtonGroup>
            <Button
              disabled={selected.stock === 0 || adding}
              onClick={addToCart}
              aria-label='Añadir al carrito'
            >
              {selected.stock > 0
                ? adding
                  ? 'Añadiendo...'
                  : 'Añadir al carrito'
                : 'Agotado'}
            </Button>
            <Button onClick={() => alert('Compra no implementada')}>
              Comprar
            </Button>
          </ButtonGroup>

          <Section>
            <h2>Descripción</h2>
            <p>{book.synopsis}</p>
          </Section>

          <Section>
            <h2>También te puede gustar</h2>
            <HomeCarrusel
              title='También te puede gustar'
              items={recs.map((b) => ({
                id: b._id,
                component: <img src={b.coverImage} alt={b.title} />
              }))}
              viewAllLink={`/categories/${encodeURIComponent(book.category)}`}
            />
          </Section>
        </Content>
      </Page>

      {/* Aside del carrito reutilizando el componente que tiene el botón */}
      {showCart && <CarritoAside onClose={() => setShowCart(false)} />}
    </>
  )
}
