import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  getBook,
  updateBook,
  deleteBook,
  listReviews,
  listAuthorsAll
} from '../../api/adminApi.js'
import { uploadBookCover } from '../../../../api/adminUpload.js'
import BookHeaderActions from '../../components/books/booksDet/BookHeaderActions.jsx'
import BookCoverUploader from '../../components/books/booksDet/BookCoverUploader.jsx'
import BookFormFields from '../../components/books/booksDet/BookFormFields.jsx'
import ReviewsCarousel from '../../components/books/booksDet/ReviewsCarousel.jsx'

const Wrap = styled.div`
  display: grid;
  gap: 16px;
  max-width: 1200px; /* ← contención en desktop para que nada se desborde */
  margin: 0 auto;
  padding: 0 12px;
  overflow-x: clip;
  box-sizing: border-box;
  @media (min-width: 768px) {
    padding: 0 16px;
  }
  @media (min-width: 1024px) {
    padding: 0 20px;
  }
`

const Top = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  /* asegura que los hijos no fuercen overflow horizontal */
  > * {
    min-width: 0;
  }
  @media (min-width: 900px) {
    grid-template-columns: 280px minmax(0, 1fr);
  }
`

/* --- NUEVO: columnas con control responsivo de portada e info --- */
const LeftCol = styled.div`
  /* columna de portada */
  min-width: 0;
  display: grid;
  align-content: start;
  justify-items: center;

  /* tamaño máximo de la portada en móviles (iPhone) */
  @media (max-width: 480px) {
    /* bloquea ancho y alto máximos para que no “explote” */
    & img {
      width: 75vw !important;
      max-width: 320px;
      height: auto !important;
      object-fit: contain !important;
      aspect-ratio: 2 / 3;
      max-height: 65vh;
    }
  }

  /* tablets */
  @media (min-width: 481px) and (max-width: 899px) {
    & img {
      width: 55vw !important;
      max-width: 360px;
      height: auto !important;
      object-fit: contain !important;
      aspect-ratio: 2 / 3;
      max-height: 70vh;
    }
  }

  /* desktop: alineado al ancho de columna (280px) */
  @media (min-width: 900px) {
    justify-items: stretch;
    & img {
      width: 100% !important;
      height: auto !important;
      object-fit: contain !important;
      aspect-ratio: 2 / 3;
      max-height: 80vh;
    }
  }

  /* por si el uploader usa un wrapper interno con img dentro */
  & img {
    display: block;
  }
`

const RightCol = styled.div`
  /* columna de formulario/info */
  min-width: 0;
  overflow: hidden; /* ← evita que la info “siga” al carrusel de reseñas */
  display: grid;
  align-content: start;

  /* títulos y campos no deben romper el layout */
  & * {
    min-width: 0;
  }
`

/* --- NUEVO: envoltorio del carrusel de reseñas para evitar desbordes --- */
const ReviewsWrap = styled.div`
  overflow: hidden;
  min-width: 0;
  /* asegura que el carrusel no exceda el ancho disponible */
  > * {
    max-width: 100%;
  }
`

// helper, extrae precio por tipo de formato
const priceFrom = (formats, t) => {
  const f = Array.isArray(formats) ? formats.find((x) => x?.type === t) : null
  return typeof f?.price === 'number' ? f.price : null
}

export default function AdminBookDetail() {
  const { id } = useParams() // id del libro
  const navigate = useNavigate()

  const [book, setBook] = useState(null) // el actual
  const [editing, setEditing] = useState(false)
  const [model, setModel] = useState(null) // form controlado
  const [authors, setAuthors] = useState([]) // select author
  const [reviews, setReviews] = useState([]) //reviews del libro

  const [newCoverFile, setNewCoverFile] = useState(null) // archivo portada nuevo
  const [newCoverPreview, setNewCoverPreview] = useState('') //objecturl preview

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      // carga de libro y autores en paralelo
      const [bRaw, auths] = await Promise.all([getBook(id), listAuthorsAll()])
      if (!alive) return
      const b = bRaw || {}
      setBook(b)
      setAuthors(Array.isArray(auths) ? auths : [])
      setModel({
        _id: b._id,
        title: b.title || '',
        author:
          typeof b.author === 'object' ? b.author?._id || '' : b.author || '',
        synopsis: b.synopsis || '',
        category: b.category || '',
        priceSoft: priceFrom(b.formats, 'TapaBlanda') ?? 0,
        priceHard: priceFrom(b.formats, 'TapaDura') ?? 0,
        priceEbook: priceFrom(b.formats, 'Ebook') ?? 0,
        formats: Array.isArray(b.formats) ? b.formats : [],
        coverImage: b.coverImage || ''
      }) //normaliza modelo edicion

      setNewCoverFile(null)
      setNewCoverPreview('')

      try {
        const resReviews = await listReviews({
          page: 1,
          limit: 500,
          bookId: id,
          order: 'desc'
        })
        const arr = Array.isArray(resReviews?.reviews)
          ? resReviews.reviews
          : Array.isArray(resReviews)
          ? resReviews
          : []
        // filtro por si api devuelve mas de un libro
        const filtered = arr.filter((r) => {
          const bk = r.book
          const bid = typeof bk === 'object' ? bk?._id || bk?.id : bk
          return String(bid || '') === String(id)
        })
        if (!alive) return
        setReviews(filtered)
        // tolera errores de reviews
      } catch {
        if (!alive) return
        setReviews([])
      }
    })()
    return () => {
      alive = false
      if (newCoverPreview) URL.revokeObjectURL(newCoverPreview) // evita memory leaks
    }
  }, [id])

  const save = async () => {
    setSaving(true)
    try {
      // reconfigura array de formato desde el form
      const formats = [
        { type: 'TapaBlanda', price: Number(model.priceSoft || 0) },
        { type: 'TapaDura', price: Number(model.priceHard || 0) },
        { type: 'Ebook', price: Number(model.priceEbook || 0) }
      ]
      await updateBook(id, {
        title: model.title,
        author: model.author,
        synopsis: model.synopsis,
        category: model.category,
        formats
      }) // actualiza campos texto/num

      if (newCoverFile) {
        // si nueva portada, la subo a parte
        try {
          const resp = await uploadBookCover(id, newCoverFile)
          setBook((b) => (b ? { ...b, coverImage: resp.coverImage } : b))
          setNewCoverFile(null)
          if (newCoverPreview) URL.revokeObjectURL(newCoverPreview)
          setNewCoverPreview('')
        } catch (e) {
          alert(
            'Los datos se guardaron, pero la actualización de portada ha fallado.'
          )
        }
      }

      // recarga libro fresh desde backend
      const fresh = await getBook(id)
      setBook(fresh)
      setModel({
        _id: fresh._id,
        title: fresh.title || '',
        author:
          typeof fresh.author === 'object'
            ? fresh.author?._id || ''
            : fresh.author || '',
        synopsis: fresh.synopsis || '',
        category: fresh.category || '',
        priceSoft: priceFrom(fresh.formats, 'TapaBlanda') ?? 0,
        priceHard: priceFrom(fresh.formats, 'TapaDura') ?? 0,
        priceEbook: priceFrom(fresh.formats, 'Ebook') ?? 0,
        formats: Array.isArray(fresh.formats) ? fresh.formats : [],
        coverImage: fresh.coverImage || ''
      })
      setEditing(false) // vuelve modo lectura
    } finally {
      setSaving(false)
    }
  }

  const cancel = () => {
    if (!book) return
    setModel({
      // restaura modelo
      _id: book._id,
      title: book.title || '',
      author:
        typeof book.author === 'object'
          ? book.author?._id || ''
          : book.author || '',
      synopsis: book.synopsis || '',
      category: book.category || '',
      priceSoft: priceFrom(book.formats, 'TapaBlanda') ?? 0,
      priceHard: priceFrom(book.formats, 'TapaDura') ?? 0,
      priceEbook: priceFrom(book.formats, 'Ebook') ?? 0,
      formats: Array.isArray(book.formats) ? book.formats : [],
      coverImage: book.coverImage || ''
    })
    if (newCoverPreview) URL.revokeObjectURL(newCoverPreview) // limpia preview
    setNewCoverFile(null)
    setNewCoverPreview('')
    setEditing(false)
  }

  const remove = async () => {
    if (!confirm('¿Eliminar este libro definitivamente?')) return
    await deleteBook(id) // elimina en backend
    navigate('/admin/books') // vuelve al listado
  }

  if (!book) return <div style={{ padding: 16 }}>Cargando…</div>

  return (
    <Wrap>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h2 style={{ fontSize: 22 }}>
          {editing ? 'Editando libro' : 'Detalle de libro'}
        </h2>
        <BookHeaderActions
          editing={editing}
          saving={saving}
          onEdit={() => setEditing(true)}
          onSave={save}
          onCancel={cancel}
          onDelete={remove}
          // acciones sobre contexto
        />
      </div>

      <Top>
        <LeftCol>
          <BookCoverUploader
            book={book}
            editing={editing}
            newCoverPreview={newCoverPreview}
            setNewCoverPreview={setNewCoverPreview}
            setNewCoverFile={setNewCoverFile}
          />
        </LeftCol>

        <RightCol>
          <BookFormFields
            book={book}
            authors={authors}
            model={model}
            setModel={setModel}
            editing={editing}
          />
        </RightCol>
      </Top>
      {/* listado horizontal con scroll sobre las reviews */}
      <ReviewsWrap>
        <ReviewsCarousel reviews={reviews} />
      </ReviewsWrap>

      {editing && (
        <div style={{ color: '#64748b', fontSize: 13 }}>
          ¿No encuentras al autor? Añádelo primero en{' '}
          <Link to='/admin/authors'>Autores</Link>.
        </div>
      )}
    </Wrap>
  )
}
