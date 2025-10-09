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
  max-width: 100%;
  overflow-x: clip;
`
const Top = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr);
  @media (min-width: 900px) {
    grid-template-columns: 280px minmax(0, 1fr);
  }
`

const priceFrom = (formats, t) => {
  const f = Array.isArray(formats) ? formats.find((x) => x?.type === t) : null
  return typeof f?.price === 'number' ? f.price : null
}

export default function AdminBookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [book, setBook] = useState(null)
  const [editing, setEditing] = useState(false)
  const [model, setModel] = useState(null)
  const [authors, setAuthors] = useState([])
  const [reviews, setReviews] = useState([])

  const [newCoverFile, setNewCoverFile] = useState(null)
  const [newCoverPreview, setNewCoverPreview] = useState('')

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
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
      })
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
        const filtered = arr.filter((r) => {
          const bk = r.book
          const bid = typeof bk === 'object' ? bk?._id || bk?.id : bk
          return String(bid || '') === String(id)
        })
        if (!alive) return
        setReviews(filtered)
      } catch {
        if (!alive) return
        setReviews([])
      }
    })()
    return () => {
      alive = false
      if (newCoverPreview) URL.revokeObjectURL(newCoverPreview)
    }
  }, [id])

  const save = async () => {
    setSaving(true)
    try {
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
      })

      if (newCoverFile) {
        try {
          const resp = await uploadBookCover(id, newCoverFile)
          setBook((b) => (b ? { ...b, coverImage: resp.coverImage } : b))
          setNewCoverFile(null)
          if (newCoverPreview) URL.revokeObjectURL(newCoverPreview)
          setNewCoverPreview('')
        } catch (e) {
          alert(
            'Los datos se guardaron, pero la actualización de portada ha fallado. Revisa /api/admin/books/:id/cover.'
          )
        }
      }

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
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const cancel = () => {
    if (!book) return
    setModel({
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
    if (newCoverPreview) URL.revokeObjectURL(newCoverPreview)
    setNewCoverFile(null)
    setNewCoverPreview('')
    setEditing(false)
  }

  const remove = async () => {
    if (!confirm('¿Eliminar este libro definitivamente?')) return
    await deleteBook(id)
    navigate('/admin/books')
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
        />
      </div>

      <Top>
        <BookCoverUploader
          book={book}
          editing={editing}
          newCoverPreview={newCoverPreview}
          setNewCoverPreview={setNewCoverPreview}
          setNewCoverFile={setNewCoverFile}
        />
        <BookFormFields
          book={book}
          authors={authors}
          model={model}
          setModel={setModel}
          editing={editing}
        />
      </Top>

      <ReviewsCarousel reviews={reviews} />

      {editing && (
        <div style={{ color: '#64748b', fontSize: 13 }}>
          ¿No encuentras al autor? Añádelo primero en{' '}
          <Link to='/admin/authors'>Autores</Link>.
        </div>
      )}
    </Wrap>
  )
}
