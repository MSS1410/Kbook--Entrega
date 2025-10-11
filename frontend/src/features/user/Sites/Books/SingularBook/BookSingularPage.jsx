import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'
import api from '../../../../../api'
import HomeCarrusel from '../../../../../components/carrouseles/HomeCarrusels'
import useCart from '../../../../../hooks/useCart'
import useAuth from '../../../../../hooks/useAuth'
import CarritoAside from '../../../../../components/carrito/carritoAside'

//  bring em here
import BookHeader from './detailComponents/BookHeader'
import FormatsPicker from './detailComponents/FormatsPicker'
import PurchaseActions from './detailComponents/PurchaseActions'
import BookDescription from './detailComponents/BookDescription'
import AuthorMore from './detailComponents/AuthorMore'
import ReviewsSection from './detailComponents/ReviewsSection'
import ReviewModal from './detailComponents/ReviewModal'

/*  style para layout  */
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

/*  Bloque inferior , zona izquierda */
const BottomWrap = styled.div`
  max-width: 1200px;
  margin: 0 auto 2rem; /* debajo del bloque superior */
  padding: 0 ${({ theme }) => theme.spacing.lg};
  @media (max-width: 992px) {
    padding: 0 ${({ theme }) => theme.spacing.md};
  }
`

// helper pequeño
const truncateWords = (str = '', n = 8) => {
  const w = String(str).trim().split(/\s+/).filter(Boolean)
  if (w.length <= n) return w.join(' ')
  return w.slice(0, n).join(' ') + '…'
}

/*  page  */
// pagina de detalle de un libro, carga libro por id.
// permite; elegir formato, comprar, carrito
// muestra: descripcion, autor +, recs, reseñas
export default function BookSingularPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()
  const { token, user } = useAuth()
  const { addOrUpdate } = useCart()

  // estado princcipal
  const [book, setBook] = useState(null) // doc del libro cargado /api/books/:id
  const [selected, setSelected] = useState(null) // formato seleccionado inicia en 0
  const [recs, setRecs] = useState([]) // recomendaciones por cateogria
  const [authorBooks, setAuthorBooks] = useState([]) // mas del mismo autor
  const [showCart, setShowCart] = useState(false) // mostrar carrito

  // flags de progreso para botones añadir/comprar
  const [adding, setAdding] = useState(false)
  const [buying, setBuying] = useState(false)

  // Reseñas
  const [reviews, setReviews] = useState([]) // reviews del libro en detalle
  const [openReview, setOpenReview] = useState(false) //abre cierra modal para escribir

  //inputs y estado guardado para nueva reseña
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')
  const [savingReview, setSavingReview] = useState(false)

  const wordCount = (text = '') =>
    String(text).trim().split(/\s+/).filter(Boolean).length
  // para maximo de palabras en reseña

  // carga en serie lo necesario
  useEffect(() => {
    async function load() {
      // try catch interno para cada bloque, si algo falla, vacia listas sin romper pagina
      try {
        const { data: b } = await api.get(`/api/books/${id}`)
        setBook(b)
        setSelected(b.formats?.[0] || null)

        // recs por categoria
        const { data: others } = await api.get(
          `/api/books?category=${encodeURIComponent(b.category)}&limit=8`
        )
        const arr = Array.isArray(others) ? others : others.books || []
        setRecs(arr.filter((x) => x._id !== id))

        // + del autor
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

        // reseñas del libro
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

    // reset UI
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
  // si no hay toquen login con next. si hay, sigue el proceso

  const addToCart = async () => {
    if (!token) {
      navigate(`/login?next=/books/${id}`)
      return
    }
    try {
      setAdding(true)
      // adding=true  -> addOrUpdate({bookId, format, quantity:1}) -> showCart=true.
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
  //igual que add , pero redirije a /chekout
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
  // exige token sino login
  const openReviewModal = () => {
    if (!token) {
      navigate(`/login?next=/books/${id}`)
      return
    }
    setOpenReview(true)
  }
  //  valida el rating,   close modal
  const submitReview = async () => {
    if (!newRating || newRating < 1 || newRating > 5) {
      alert('Elige una puntuación entre 1 y 5.')
      return
    }
    // comentario 150 palabras,
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
      // POST en /api/reviews,
    } catch (err) {
      const status = err?.response?.status
      if (status === 401) {
        navigate(`/login?next=/books/${id}`)
        return
      }
      // si usuario no compra libro no puede escribir reseña
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
      {/*  Bloque superior: portada + info del libro  */}
      <Page>
        <Sidebar>
          <CoverCard>
            <Cover src={book.coverImage} alt={book.title} />
          </CoverCard>
        </Sidebar>

        <Content>
          {/* header */}
          <BookHeader
            title={book.title}
            author={book.author}
            category={book.category}
          />

          {/* formatos */}
          <Section>
            <SectionTitle>Formatos disponibles</SectionTitle>
            <FormatsPicker
              formats={book.formats || []}
              selected={selected}
              onSelect={setSelected}
            />
          </Section>

          {/* botones para compra */}
          <PurchaseActions
            selected={selected}
            adding={adding}
            buying={buying}
            onAddToCart={addToCart}
            onBuyNow={buyNow}
          />

          {/* descripcion) */}
          <Section>
            <BookDescription synopsis={book.synopsis} />
          </Section>
        </Content>
      </Page>

      {/*  bloque inferior: secciones  a la izquierda  */}
      <BottomWrap>
        {/* also could like, recomendaciones */}
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

        {/* + del autor */}
        {book.author?._id && (
          <Section>
            <AuthorMore author={book.author} authorBooks={authorBooks} />
          </Section>
        )}

        {/* reseñas  */}
        <Section>
          <SectionTitle>Reseñas</SectionTitle>
          <ReviewsSection
            bookId={book._id}
            bookTitle={book.title}
            reviews={reviews}
            onOpenModal={openReviewModal}
          />
        </Section>
      </BottomWrap>

      {showCart && <CarritoAside onClose={() => setShowCart(false)} />}

      {/* Modal para nueva reseña  */}
      <ReviewModal
        open={openReview}
        onClose={() => setOpenReview(false)}
        rating={newRating}
        onRatingChange={setNewRating}
        comment={newComment}
        onCommentChange={(e) => setNewComment(e.target.value)}
        wordCount={wordCount(newComment)}
        onSubmit={submitReview}
        saving={savingReview}
      />
    </>
  )
}
