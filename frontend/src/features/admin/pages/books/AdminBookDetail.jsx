// frontend/src/features/admin/pages/books/AdminBookDetail.jsx
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import ReviewCard from '../../components/cards/ReviewCard.jsx'
import {
  getBook,
  updateBook,
  deleteBook,
  listReviews,
  listAuthorsAll
} from '../../api/adminApi.js'
import { uploadBookCover } from '../../../../api/adminUpload.js'
import { Pencil, Save, X, Trash2 } from 'lucide-react'
import { absUrl } from '../../../../utils/absUrl.js'

const Wrap = styled.div`
  display: grid;
  gap: 16px;
  max-width: 100%;
  overflow-x: clip; /* ✅ evita scroll horizontal global */
`
const Top = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr);
  @media (min-width: 900px) {
    grid-template-columns: 280px minmax(0, 1fr);
  }
`
const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  min-width: 0; /* ✅ importante en layouts de grid/flex */
`
const Block = styled(Card)`
  padding: 16px;
  display: grid;
  gap: 10px;
  min-width: 0; /* ✅ evita overflow por contenido mínimo */
`
const Cover = styled.div`
  aspect-ratio: 3/4;
  background: #eee;
  border-radius: ${({ theme }) => theme.radii.lg}
    ${({ theme }) => theme.radii.lg} 0 0;
  overflow: hidden; /* ✅ elimina reboses por subpíxeles/imagen */
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`
const Field = styled.label`
  display: grid;
  gap: 6px;
`
const FieldLabel = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
`

/* ===== Carrusel reseñas sin empujar el ancho de la página ===== */
const ReviewsStrip = styled.div`
  display: flex;
  gap: 50px;
  overflow-x: auto; /* el scroll queda contenido aquí */
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  padding-bottom: 6px;
  max-width: 100%;
  min-width: 0;
`
const ReviewsItem = styled.div`
  flex: 0 0 280px;
  min-width: 280px;
`

const money = (n) =>
  typeof n === 'number'
    ? n.toLocaleString(undefined, { style: 'currency', currency: 'EUR' })
    : '—'
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

  // Nueva portada por fichero (sin URL)
  const [newCoverFile, setNewCoverFile] = useState(null)
  const [newCoverPreview, setNewCoverPreview] = useState('')

  const [saving, setSaving] = useState(false)

  const priceLabel = (b, t) => money(priceFrom(b?.formats, t))
  const sameId = (a, b) => String(a || '').trim() === String(b || '').trim()

  useEffect(() => {
    let alive = true
    ;(async () => {
      // Libro + autores
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

      // Reseñas (como antes + filtro cliente)
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
          return sameId(bid, id)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const onPickCover = (e) => {
    const f = e.target.files?.[0]
    setNewCoverFile(f || null)
    if (newCoverPreview) URL.revokeObjectURL(newCoverPreview)
    setNewCoverPreview(f ? URL.createObjectURL(f) : '')
  }

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

      // Subir nueva portada si hay fichero
      if (newCoverFile) {
        try {
          const resp = await uploadBookCover(id, newCoverFile)
          setBook((b) => (b ? { ...b, coverImage: resp.coverImage } : b))
          setNewCoverFile(null)
          if (newCoverPreview) URL.revokeObjectURL(newCoverPreview)
          setNewCoverPreview('')
        } catch (e) {
          alert(
            'Los datos se guardaron, pero la actualización de portada ha fallado. Revisa el endpoint /api/admin/books/:id/cover.'
          )
        }
      }

      // Refresca modelo tras guardar
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

  const authorName =
    typeof book.author === 'object'
      ? book.author?.name || '—'
      : authors.find((a) => String(a._id) === String(book.author))?.name ||
        book.author ||
        '—'

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
        <div style={{ display: 'flex', gap: 8 }}>
          {editing ? (
            <>
              <Button disabled={saving} onClick={save}>
                <Save size={16} /> {saving ? 'Guardando…' : 'Guardar'}
              </Button>
              <Button $variant='ghost' onClick={cancel}>
                <X size={16} /> Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button $variant='ghost' onClick={() => setEditing(true)}>
                <Pencil size={16} /> Editar
              </Button>
              <Button $variant='danger' onClick={remove}>
                <Trash2 size={16} /> Eliminar
              </Button>
            </>
          )}
        </div>
      </div>

      <Top>
        <Card>
          <Cover>
            {book.coverImage ? (
              <img src={absUrl(book.coverImage)} alt={book.title} />
            ) : null}
          </Cover>

          {editing && (
            <div
              style={{
                padding: 12,
                borderTop: '1px solid var(--border,#E2E8F0)',
                display: 'grid',
                gap: 10
              }}
            >
              <Field>
                <FieldLabel>Nueva portada (archivo)</FieldLabel>
                <input
                  type='file'
                  accept='image/*'
                  onChange={onPickCover}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid var(--border,#E2E8F0)',
                    borderRadius: 10,
                    background: '#fff'
                  }}
                />
              </Field>
              {newCoverPreview ? (
                <div
                  style={{
                    maxHeight: 240,
                    overflow: 'hidden',
                    borderRadius: 10
                  }}
                >
                  <img
                    src={newCoverPreview}
                    alt='Vista previa'
                    style={{
                      display: 'block',
                      width: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              ) : null}
            </div>
          )}
        </Card>

        <Block>
          <Field>
            <FieldLabel>Título</FieldLabel>
            {editing ? (
              <input
                value={model?.title || ''}
                onChange={(e) =>
                  setModel((m) => ({ ...m, title: e.target.value }))
                }
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border,#E2E8F0)',
                  borderRadius: 10
                }}
              />
            ) : (
              <div>{book.title || '—'}</div>
            )}
          </Field>

          <Field>
            <FieldLabel>Autor</FieldLabel>
            {editing ? (
              <select
                value={model.author}
                onChange={(e) =>
                  setModel((m) => ({ ...m, author: e.target.value }))
                }
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid var(--border,#E2E8F0)',
                  borderRadius: 10
                }}
              >
                <option value=''>Selecciona autor…</option>
                {authors.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>
            ) : (
              <div>{authorName}</div>
            )}
          </Field>

          <Field>
            <FieldLabel>Categoría</FieldLabel>
            {editing ? (
              <select
                value={model.category}
                onChange={(e) =>
                  setModel((m) => ({ ...m, category: e.target.value }))
                }
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid var(--border,#E2E8F0)',
                  borderRadius: 10
                }}
              >
                {[
                  'Ciencia Ficción',
                  'Aventuras',
                  'Historia',
                  'Psicologia',
                  'Infantiles',
                  'Ciencia',
                  'Natura'
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            ) : (
              <div>{book.category || '—'}</div>
            )}
          </Field>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
              gap: 8
            }}
          >
            <Field>
              <FieldLabel>Precio blanda</FieldLabel>
              {editing ? (
                <input
                  type='number'
                  step='0.01'
                  value={model?.priceSoft ?? 0}
                  onChange={(e) =>
                    setModel((m) => ({
                      ...m,
                      priceSoft: Number(e.target.value)
                    }))
                  }
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border,#E2E8F0)',
                    borderRadius: 10
                  }}
                />
              ) : (
                <div>{priceLabel(book, 'TapaBlanda')}</div>
              )}
            </Field>
            <Field>
              <FieldLabel>Precio dura</FieldLabel>
              {editing ? (
                <input
                  type='number'
                  step='0.01'
                  value={model?.priceHard ?? 0}
                  onChange={(e) =>
                    setModel((m) => ({
                      ...m,
                      priceHard: Number(e.target.value)
                    }))
                  }
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border,#E2E8F0)',
                    borderRadius: 10
                  }}
                />
              ) : (
                <div>{priceLabel(book, 'TapaDura')}</div>
              )}
            </Field>
            <Field>
              <FieldLabel>Precio eBook</FieldLabel>
              {editing ? (
                <input
                  type='number'
                  step='0.01'
                  value={model?.priceEbook ?? 0}
                  onChange={(e) =>
                    setModel((m) => ({
                      ...m,
                      priceEbook: Number(e.target.value)
                    }))
                  }
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border,#E2E8F0)',
                    borderRadius: 10
                  }}
                />
              ) : (
                <div>{priceLabel(book, 'Ebook')}</div>
              )}
            </Field>
          </div>

          <Field>
            <FieldLabel>Sinopsis</FieldLabel>
            {editing ? (
              <textarea
                rows={6}
                value={model?.synopsis ?? ''}
                onChange={(e) =>
                  setModel((m) => ({ ...m, synopsis: e.target.value }))
                }
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border,#E2E8F0)',
                  borderRadius: 10
                }}
              />
            ) : (
              <div>{book?.synopsis || '—'}</div>
            )}
          </Field>
        </Block>
      </Top>

      <Card style={{ padding: 16 }}>
        <strong>Reseñas ({reviews.length})</strong>
        {reviews.length ? (
          <ReviewsStrip>
            {reviews.map((r) => (
              <ReviewsItem key={r._id}>
                <ReviewCard r={r} />
              </ReviewsItem>
            ))}
          </ReviewsStrip>
        ) : (
          <div style={{ color: '#64748b' }}>Sin reseñas.</div>
        )}
      </Card>

      {editing && (
        <div style={{ color: '#64748b', fontSize: 13 }}>
          ¿No encuentras al autor? Añádelo primero en{' '}
          <Link to='/admin/authors'>Autores</Link>.
        </div>
      )}
    </Wrap>
  )
}
