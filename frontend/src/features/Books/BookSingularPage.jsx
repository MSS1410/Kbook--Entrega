// frontend/src/features/Books/BookSingularPage.jsx
import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'
import api from '../../api'
import HomeCarrusel from '../../components/carrouseles/HomeCarrusels'
import useCart from '../../hooks/useCart'
import useAuth from '../../hooks/useAuth'
import CarritoAside from '../../components/carrito/carritoAside'
import Modal from '../../components/modal/Modal'

/* ==================== Estilos ==================== */
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

const Sidebar = styled.aside`
  flex: 0 0 320px;
  align-self: start;
  @media (max-width: 992px) {
    width: 100%;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    flex: 1 1 auto;
  }
`

const CoverCard = styled.div`
  position: sticky;
  top: ${({ theme }) => theme.layout?.stickyOffset || '80px'};
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
`

const Cover = styled.img`
  width: 100%;
  height: auto;
  border-radius: ${({ theme }) => theme.radii.sm};
  display: block;
`

const Content = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  width: 100%;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  @media (max-width: 992px) {
    padding: 0;
    gap: ${({ theme }) => theme.spacing.md};
  }
`

/* Header bonito */
const HeaderBlock = styled.header`
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: grid;
  gap: 8px;
`

const Title = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  line-height: 1.15;
  @media (max-width: 576px) {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }
`

const MetaBar = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
  color: ${({ theme }) => theme.colors.onSurface};
`

const AuthorLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 700;
  &:hover {
    text-decoration: underline;
  }
`

const Badge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.surfaceVariant};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.onSurface};
`

const Section = styled.section`
  margin-top: ${({ theme }) => theme.spacing.xl};
  @media (max-width: 992px) {
    margin-top: ${({ theme }) => theme.spacing.md};
  }
`

const SectionTitle = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  font-size: ${({ theme }) => theme.fontSizes.xl};
`

const FormatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`

const FormatCard = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.onSurfaceVariant};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.08s;
  background: ${({ theme }) => theme.colors.cardBg};
  text-align: left;
  &:hover {
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
  }
  &:active {
    transform: translateY(1px);
  }
  &.active {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary};
  }
`

const Price = styled.p`
  margin: 0;
  font-weight: 700;
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
  font-weight: 600;
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  @media (max-width: 576px) {
    flex: 1 1 100%;
  }
`

const GhostLink = styled(Link)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 600;
  display: inline-block;
`

/* === Bloque inferior (debajo de todo, a la izquierda del contenedor) === */
const BottomWrap = styled.div`
  max-width: 1200px;
  margin: 0 auto 2rem; /* debajo del bloque superior */
  padding: 0 ${({ theme }) => theme.spacing.lg};
  @media (max-width: 992px) {
    padding: 0 ${({ theme }) => theme.spacing.md};
  }
`

/* Reseñas */
const ReviewCard = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.cardBg};
  display: grid;
  gap: 6px;
`

const Stars = styled.div`
  font-size: 16px;
  letter-spacing: 2px;
  color: #f59e0b;
`

const SmallMeta = styled.small`
  color: ${({ theme }) => theme.colors.mutedText};
`

const Muted = styled.p`
  color: ${({ theme }) => theme.colors.mutedText};
  margin: 0.5rem 0 0;
`

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: ${({ theme }) => theme.spacing.md};
`

const ModalButton = styled.button`
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid
    ${({ $ghost, theme }) => ($ghost ? theme.colors.primary : 'transparent')};
  background: ${({ $ghost, theme }) =>
    $ghost ? 'transparent' : theme.colors.primary};
  color: ${({ $ghost, theme }) =>
    $ghost ? theme.colors.primary : theme.colors.onPrimary};
  cursor: pointer;
`

const StarPicker = styled.div`
  display: inline-flex;
  gap: 6px;
  font-size: 22px;
  cursor: pointer;
  user-select: none;
`

const ReviewTextarea = styled.textarea`
  width: 100%;
  min-height: 110px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 10px 12px;
  resize: vertical;
`

// helper arriba del componente
const truncateWords = (str = '', n = 8) => {
  const w = String(str).trim().split(/\s+/).filter(Boolean)
  if (w.length <= n) return w.join(' ')
  return w.slice(0, n).join(' ') + '…'
}

/* ==================== Página ==================== */
export default function BookSingularPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()
  const { token, user } = useAuth()
  const { addOrUpdate } = useCart()

  const [book, setBook] = useState(null)
  const [selected, setSelected] = useState(null)
  const [recs, setRecs] = useState([])
  const [authorBooks, setAuthorBooks] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [adding, setAdding] = useState(false)
  const [buying, setBuying] = useState(false)

  // Reseñas
  const [reviews, setReviews] = useState([])
  const [openReview, setOpenReview] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')
  const [savingReview, setSavingReview] = useState(false)

  const wordCount = (text = '') =>
    String(text).trim().split(/\s+/).filter(Boolean).length

  useEffect(() => {
    async function load() {
      try {
        const { data: b } = await api.get(`/api/books/${id}`)
        setBook(b)
        setSelected(b.formats?.[0] || null)

        // Recs por categoría
        const { data: others } = await api.get(
          `/api/books?category=${encodeURIComponent(b.category)}&limit=8`
        )
        const arr = Array.isArray(others) ? others : others.books || []
        setRecs(arr.filter((x) => x._id !== id))

        // Más del autor
        if (b.author?._id) {
          try {
            const { data: authorData } = await api.get(
              `/api/authors/${b.author._id}`
            )
            const ab = Array.isArray(authorData?.books) ? authorData.books : []
            setAuthorBooks(ab.filter((x) => String(x._id) !== String(id)))
          } catch {
            setAuthorBooks([])
          }
        } else {
          setAuthorBooks([])
        }

        // Reseñas del libro
        try {
          const { data: rv } = await api.get(`/api/reviews/book/${b._id}`)
          setReviews(Array.isArray(rv) ? rv : [])
        } catch {
          setReviews([])
        }
      } catch (err) {
        console.error('Error cargando libro singular:', err)
      }
    }
    load()

    setShowCart(false)
    setAdding(false)
    setBuying(false)
    setOpenReview(false)
    setNewRating(5)
    setNewComment('')
    window.scrollTo(0, 0)
  }, [id])

  if (!book)
    return <p style={{ maxWidth: 1200, margin: '2rem auto' }}>Cargando…</p>
  if (!selected)
    return (
      <p style={{ maxWidth: 1200, margin: '2rem auto' }}>
        Seleccionando formato…
      </p>
    )

  const addToCart = async () => {
    if (!token) {
      navigate(`/login?next=/books/${id}`)
      return
    }
    try {
      setAdding(true)
      await addOrUpdate({ bookId: id, format: selected.type, quantity: 1 })
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

  const buyNow = async () => {
    if (!token) {
      navigate(`/login?next=/books/${id}`)
      return
    }
    try {
      setBuying(true)
      await addOrUpdate({ bookId: id, format: selected.type, quantity: 1 })
      navigate('/checkout')
    } catch (err) {
      console.error('Error en Comprar ahora:', err)
      alert(
        'No se pudo iniciar la compra: ' +
          (err.response?.data?.message || err.message)
      )
    } finally {
      setBuying(false)
    }
  }

  const openReviewModal = () => {
    if (!token) {
      navigate(`/login?next=/books/${id}`)
      return
    }
    setOpenReview(true)
  }

  const submitReview = async () => {
    if (!newRating || newRating < 1 || newRating > 5) {
      alert('Elige una puntuación entre 1 y 5.')
      return
    }
    if (wordCount(newComment) > 50) {
      alert('Máximo 50 palabras en la reseña.')
      return
    }
    try {
      setSavingReview(true)
      const { data } = await api.post('/api/reviews', {
        book: id,
        rating: newRating,
        comment: newComment.trim()
      })
      const created = {
        ...(data || {}),
        user: data?.user?.name ? data.user : { name: user?.name || 'Tú' }
      }
      setReviews((prev) => [created, ...prev])
      setOpenReview(false)
      setNewRating(5)
      setNewComment('')
    } catch (err) {
      const status = err?.response?.status
      if (status === 401) {
        navigate(`/login?next=/books/${id}`)
        return
      }
      if (status === 403) {
        alert('Solo puedes reseñar libros que compraste.')
      } else {
        console.error(
          'Error creando reseña:',
          err?.response?.data || err.message
        )
        alert('No se pudo guardar la reseña.')
      }
    } finally {
      setSavingReview(false)
    }
  }

  return (
    <>
      {/* ===== Bloque superior: portada + info del libro ===== */}
      <Page>
        <Sidebar>
          <CoverCard>
            <Cover src={book.coverImage} alt={book.title} />
          </CoverCard>
        </Sidebar>

        <Content>
          {/* Header estilizado */}
          <HeaderBlock>
            <Title>{book.title}</Title>
            <MetaBar>
              {book.author?._id ? (
                <>
                  de{' '}
                  <AuthorLink to={`/authors/${book.author._id}`}>
                    {book.author.name}
                  </AuthorLink>
                </>
              ) : (
                <>
                  de <strong>{book.author?.name || '—'}</strong>
                </>
              )}
              <Badge>{book.category}</Badge>
            </MetaBar>
          </HeaderBlock>

          <Section>
            <SectionTitle>Formatos disponibles</SectionTitle>
            <FormatsGrid>
              {book.formats?.map((f) => (
                <FormatCard
                  key={f.type}
                  type='button'
                  onClick={() => setSelected(f)}
                  className={selected?.type === f.type ? 'active' : ''}
                  aria-label={`Seleccionar formato ${f.label}`}
                  title={`Seleccionar ${f.label}`}
                >
                  <span>{f.label}</span>
                  <Price>{(f.price ?? 0).toFixed(2)} €</Price>
                  {/* Stock eliminado (ignoramos existencias) */}
                </FormatCard>
              ))}
            </FormatsGrid>
          </Section>

          <ButtonGroup>
            {/* SIEMPRE permitimos añadir al carrito (ignorando stock) */}
            <Button
              disabled={!selected || adding}
              onClick={addToCart}
              aria-label='Añadir al carrito'
            >
              {adding ? 'Añadiendo…' : 'Añadir al carrito'}
            </Button>

            {/* También permitimos Comprar ahora sin mirar stock */}
            <Button
              disabled={!selected || buying}
              onClick={buyNow}
              aria-label='Comprar ahora'
            >
              {buying ? 'Redirigiendo…' : 'Comprar'}
            </Button>
          </ButtonGroup>

          <Section>
            <SectionTitle>Descripción</SectionTitle>
            <p style={{ margin: 0, color: theme.colors.onSurface }}>
              {book.synopsis}
            </p>
          </Section>
        </Content>
      </Page>

      {/* ===== Bloque inferior: secciones alineadas a la izquierda ===== */}
      <BottomWrap>
        {/* También te puede gustar */}
        <Section>
          <SectionTitle>También te puede gustar</SectionTitle>
          <HomeCarrusel
            title='También te puede gustar'
            items={(recs || []).map((b) => ({
              id: b._id,
              link: `/books/${b._id}`,
              component: (
                <img
                  src={b.coverImage}
                  alt={b.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: theme.radii.sm
                  }}
                />
              )
            }))}
            viewAllLink={`/categories/${encodeURIComponent(book.category)}`}
            itemWidth={160}
            itemHeight={240}
          />
        </Section>

        {/* Conoce más del autor */}
        {book.author?._id && (
          <Section>
            <SectionTitle>
              Conoce más de {book.author?.name || 'este autor'}
            </SectionTitle>

            {authorBooks.length > 0 && (
              <HomeCarrusel
                title={`Más de ${book.author?.name || ''}`}
                items={authorBooks.map((b) => ({
                  id: b._id,
                  link: `/books/${b._id}`,
                  component: (
                    <img
                      src={
                        b.coverImage ||
                        'https://via.placeholder.com/160x240?text=Libro'
                      }
                      alt={b.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: theme.radii.sm
                      }}
                    />
                  )
                }))}
                viewAllLink={`/authors/${book.author._id}`}
                itemWidth={160}
                itemHeight={240}
                viewAllLabel='Ver más'
              />
            )}

            <div style={{ marginTop: theme.spacing.md }}>
              <GhostLink to={`/authors/${book.author._id}`}>
                Conoce a {book.author.name}
              </GhostLink>
            </div>
          </Section>
        )}

        {/* Reseñas */}
        <Section>
          <SectionTitle>Reseñas</SectionTitle>

          {reviews.length === 0 ? (
            <>
              <Muted>
                Aún no hay reseñas para <strong>{book.title}</strong>. ¡Sé el
                primero en dejar la tuya!
              </Muted>
              <div style={{ marginTop: theme.spacing.sm }}>
                <Button onClick={openReviewModal}>Deja tu huella</Button>{' '}
                <GhostLink to={`/reviews?book=${book._id}`}>
                  Ver todas
                </GhostLink>
              </div>
            </>
          ) : (
            <>
              <HomeCarrusel
                title='Opiniones de lectores'
                items={reviews.map((r) => ({
                  id: r._id || `${r.user?.name}-${r.createdAt}`,
                  component: (
                    <ReviewCard>
                      <Stars>
                        {'★'.repeat(r.rating || 0)}
                        {'☆'.repeat(5 - (r.rating || 0))}
                      </Stars>
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {truncateWords(
                          r.comment || r.description || '(Sin comentario)',
                          12
                        )}
                      </div>
                      <SmallMeta>
                        {r.user?.name || 'Anónimo'} •{' '}
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString()
                          : ''}
                      </SmallMeta>
                    </ReviewCard>
                  )
                }))}
                viewAllLink={`/books/${book._id}/reviews`}
                itemWidth={260}
                itemHeight={160}
                itemGap={12}
                viewAllLabel='Ver más'
              />

              <div style={{ marginTop: theme.spacing.sm }}>
                <Button onClick={openReviewModal}>Deja tu huella</Button>{' '}
                <GhostLink to={`/books/${book._id}/reviews`}>Ver más</GhostLink>
              </div>
            </>
          )}
        </Section>
      </BottomWrap>

      {showCart && <CarritoAside onClose={() => setShowCart(false)} />}

      {/* Modal reseña */}
      <Modal open={openReview} onClose={() => setOpenReview(false)}>
        <h3 style={{ marginTop: 0 }}>Escribe una reseña</h3>
        <div style={{ marginBottom: 12 }}>Puntúa tu experiencia:</div>
        <StarPicker>
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              onClick={() => setNewRating(n)}
              title={`${n} estrellas`}
              aria-label={`${n} estrellas`}
              style={{ color: n <= newRating ? '#f59e0b' : '#bbb' }}
            >
              ★
            </span>
          ))}
        </StarPicker>

        <div style={{ marginTop: 12 }}>
          <ReviewTextarea
            placeholder='Cuéntanos qué te ha parecido… (máx. 50 palabras)'
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <SmallMeta>{wordCount(newComment)} / 50 palabras</SmallMeta>
        </div>

        <ModalActions>
          <ModalButton
            $ghost
            type='button'
            onClick={() => setOpenReview(false)}
          >
            Cancelar
          </ModalButton>
          <ModalButton
            type='button'
            onClick={submitReview}
            disabled={savingReview}
          >
            {savingReview ? 'Guardando…' : 'Publicar'}
          </ModalButton>
        </ModalActions>
      </Modal>
    </>
  )
}
