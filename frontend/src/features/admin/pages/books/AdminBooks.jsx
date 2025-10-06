import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import Modal from '../../components/Modal.jsx'
import {
  listBooksAll,
  createBook,
  deleteBook,
  listAuthorsAll
} from '../../api/adminApi.js'
import { uploadBookCover } from '../../../../api/adminUpload.js'
import { absUrl } from '../../../../utils/absUrl.js'
import {
  Search,
  Plus,
  Trash2,
  Eye,
  Grid,
  List,
  AlertTriangle,
  ChevronDown,
  Image as ImageIcon
} from 'lucide-react'

import useScrollToTopOn from '../../../../hooks/useScrollToTopOn' // 👈 NUEVO

const categoriesEnum = [
  'Ciencia Ficción',
  'Aventuras',
  'Historia',
  'Psicologia',
  'Infantiles',
  'Ciencia',
  'Natura'
]

const HeadRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`
const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  input,
  select {
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.cardBg};
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 14px;
  }
`
const ViewToggle = styled.div`
  display: inline-flex;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  overflow: hidden;
  button {
    background: ${({ theme }) => theme.colors.cardBg};
    padding: 8px 10px;
    border: 0;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.text};
  }
  button[data-active='true'] {
    background: ${({ theme }) => theme.colors.mutedSurface};
    color: ${({ theme }) => theme.colors.accent};
    font-weight: 600;
  }
`

/* ===== GRID con alturas homogéneas ===== */
const GridWrap = styled.div`
  display: grid;
  gap: 16px;
  align-items: stretch;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  @media (min-width: 900px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`
const Card = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  overflow: hidden;
`
const Cover = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #eee;
  flex: 0 0 auto;
  &::before {
    content: '';
    display: block;
    padding-bottom: 133.333%;
  } /* 3/4 */
  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`
const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  flex: 1 1 auto;
`
const Info = styled.div`
  display: grid;
  gap: 6px;
  min-height: calc((1.25em * 2) + 1em + 6px);
`
const Title = styled.h3`
  font-size: 15px;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: calc(1.25em * 2);
`
const Meta = styled.small`
  color: ${({ theme }) => theme.colors.mutedText};
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 1em;
`
const Actions = styled.div`
  margin-top: auto;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  a,
  button {
    font-size: 13px;
  }
`

/* ===== LISTA ===== */
const ListWrap = styled.div`
  display: grid;
  gap: 12px;
`
const Row = styled.div`
  display: grid;
  gap: 12px;
  align-items: center;
  grid-template-columns: 72px 1fr auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  padding: 8px;
`
const RowMeta = styled.div`
  display: grid;
  gap: 4px;
  .syn {
    color: ${({ theme }) => theme.colors.mutedText};
    font-size: 13px;
  }
`

const Pager = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  button {
    padding: 8px 12px;
    border-radius: 10px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.cardBg};
  }
  strong {
    min-width: 80px;
    text-align: center;
  }
`

const Note = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.mutedSurface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
`

/* ====== Combo Autor ====== */
const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: start;
`
const ComboWrap = styled.div`
  position: relative;
`
const ComboInput = styled.input`
  width: 100%;
  padding: 10px 36px 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
`
const ComboSuffix = styled.div`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #8a8a8a;
  display: grid;
  place-items: center;
`
const ComboList = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  max-height: 240px;
  overflow: auto;
  z-index: 20;
`
const ComboItem = styled.button`
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  padding: 10px 12px;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.mutedSurface};
  }
`

/* ====== Vista previa de imagen en modal (altura limitada) ====== */
const PreviewBox = styled.div`
  border: 1px dashed ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: 12px;
  padding: 8px;
  display: grid;
  place-items: center;
  max-height: 260px; /* 👈 evita que el modal crezca demasiado */
  overflow: auto; /* 👈 si la imagen es grande, permite scroll interno */
  img {
    max-width: 100%;
    max-height: 240px; /* 👈 límite duro de altura visible */
    display: block;
    object-fit: contain;
  }
`

export default function AdminBooks() {
  const [books, setBooks] = useState([])
  const [authors, setAuthors] = useState([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [view, setView] = useState('grid') // grid | list
  const [loading, setLoading] = useState(true)

  // paginación UI
  const pageSize = 12
  const [page, setPage] = useState(1)

  useScrollToTopOn(page, q, category)

  // modal crear
  const [openCreate, setOpenCreate] = useState(false)
  const [creating, setCreating] = useState({
    title: '',
    author: '', // authorId
    category: '',
    synopsis: '',
    coverImage: '', // URL (opcional si eliges archivo)
    priceSoft: '',
    priceHard: '',
    priceEbook: ''
  })
  const [savingCreate, setSavingCreate] = useState(false)

  // archivo de portada (nuevo)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')

  // combo autor
  const [authorQuery, setAuthorQuery] = useState('')
  const [comboOpen, setComboOpen] = useState(false)
  const comboRef = useRef(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const [allBooks, allAuthors] = await Promise.all([
          listBooksAll(),
          listAuthorsAll()
        ])
        setBooks(Array.isArray(allBooks) ? allBooks : [])
        setAuthors(Array.isArray(allAuthors) ? allAuthors : [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // cuando cambia el autor seleccionado, sincroniza el texto del combo
  useEffect(() => {
    if (!creating.author) {
      setAuthorQuery('')
      return
    }
    const found = authors.find((a) => String(a._id) === String(creating.author))
    setAuthorQuery(found?.name || '')
  }, [creating.author, authors])

  // cerrar combo al hacer click fuera
  useEffect(() => {
    const onDoc = (e) => {
      if (!comboRef.current) return
      if (!comboRef.current.contains(e.target)) setComboOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  // revoke objectURL al cerrar modal o cambiar archivo
  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview)
    }
  }, [coverPreview])

  const filtered = useMemo(() => {
    let arr = [...books]
    if (q.trim()) {
      const s = q.trim().toLowerCase()
      arr = arr.filter((b) => (b.title || '').toLowerCase().includes(s))
    }
    if (category) {
      arr = arr.filter((b) => String(b.category) === String(category))
    }
    return arr
  }, [books, q, category])

  // paginación cliente
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages])
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  const onDelete = async (id) => {
    if (!confirm('¿Eliminar este libro?')) return
    await deleteBook(id)
    const all = await listBooksAll()
    setBooks(all)
  }

  const openCreateModal = () => {
    setCreating({
      title: '',
      author: '',
      category: '',
      synopsis: '',
      coverImage: '',
      priceSoft: '',
      priceHard: '',
      priceEbook: ''
    })
    setCoverFile(null)
    if (coverPreview) URL.revokeObjectURL(coverPreview)
    setCoverPreview('')
    setAuthorQuery('')
    setOpenCreate(true)
  }

  const saveCreate = async () => {
    // Validación obligatoria
    const required = [
      'title',
      'author',
      'category',
      'synopsis',
      'priceSoft',
      'priceHard',
      'priceEbook'
    ]
    for (const k of required) {
      const v = creating[k]
      if (v === '' || v === null || v === undefined) {
        alert('Por favor, completa todos los campos obligatorios.')
        return
      }
    }
    // Autor existente
    const exists = authors.some(
      (a) => String(a._id) === String(creating.author)
    )
    if (!exists) {
      alert('Debe elegir un autor que ya exista en la base de datos.')
      return
    }

    setSavingCreate(true)
    try {
      // 1) Creamos el libro SIN depender de la portada de archivo
      const formats = [
        { type: 'TapaBlanda', price: Number(creating.priceSoft) },
        { type: 'TapaDura', price: Number(creating.priceHard) },
        { type: 'Ebook', price: Number(creating.priceEbook) }
      ]
      const payload = {
        title: creating.title,
        author: creating.author,
        synopsis: creating.synopsis,
        category: creating.category,
        coverImage: creating.coverImage || '', // si pegaste URL, se guarda
        formats
      }
      const created = await createBook(payload)

      // 2) Si eliges archivo, súbelo ahora (tiene prioridad sobre coverImage url)
      if (created?._id && coverFile) {
        try {
          await uploadBookCover(created._id, coverFile)
        } catch (e) {
          console.error(e)
          alert(
            'Libro creado pero la subida de portada ha fallado. Revisa que el endpoint /api/admin/books/:id/cover exista en el backend.'
          )
        }
      }

      // 3) Cerrar modal y refrescar listado
      setOpenCreate(false)
      const all = await listBooksAll()
      setBooks(all)
    } finally {
      setSavingCreate(false)
      // limpieza
      if (coverPreview) URL.revokeObjectURL(coverPreview)
      setCoverPreview('')
      setCoverFile(null)
    }
  }

  // autores filtrados por el texto del combo
  const authorsFiltered = useMemo(() => {
    const q = authorQuery.trim().toLowerCase()
    if (!q) return authors.slice(0, 20)
    return authors
      .filter((a) => (a.name || '').toLowerCase().includes(q))
      .slice(0, 20)
  }, [authors, authorQuery])

  return (
    <>
      <HeadRow>
        <h2 style={{ fontSize: 22 }}>Biblioteca</h2>
        <Filters>
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#999'
              }}
            />
            <input
              style={{ paddingLeft: 32 }}
              placeholder='Buscar por título'
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              setPage(1)
            }}
          >
            <option value=''>Todas las categorías</option>
            {categoriesEnum.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <ViewToggle>
            <button
              data-active={view === 'grid'}
              onClick={() => setView('grid')}
              title='Vista grid'
            >
              <Grid size={16} />
            </button>
            <button
              data-active={view === 'list'}
              onClick={() => setView('list')}
              title='Vista lista'
            >
              <List size={16} />
            </button>
          </ViewToggle>

          <Button $variant='primary' onClick={openCreateModal}>
            <Plus size={16} /> Añadir libro
          </Button>
        </Filters>
      </HeadRow>

      {loading ? (
        <div style={{ padding: 16 }}>Cargando…</div>
      ) : pageItems.length === 0 ? (
        <div style={{ padding: 16, color: '#64748b' }}>Sin resultados.</div>
      ) : view === 'grid' ? (
        <>
          <GridWrap>
            {pageItems.map((b) => (
              <Card key={b._id}>
                <Cover>
                  {b.coverImage ? (
                    <img src={absUrl(b.coverImage)} alt={b.title} />
                  ) : (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'grid',
                        placeItems: 'center',
                        color: '#94a3b8',
                        fontSize: 12
                      }}
                    >
                      <ImageIcon size={24} />
                    </div>
                  )}
                </Cover>
                <CardBody>
                  <Info>
                    <Title title={b.title}>{b.title}</Title>
                    <Meta>{b.category}</Meta>
                  </Info>
                  <Actions>
                    <Button
                      as={Link}
                      $variant='ghost'
                      to={`/admin/books/${b._id}`}
                    >
                      <Eye size={16} /> Ver detalle
                    </Button>
                    <Button $variant='danger' onClick={() => onDelete(b._id)}>
                      <Trash2 size={16} /> Eliminar
                    </Button>
                  </Actions>
                </CardBody>
              </Card>
            ))}
          </GridWrap>

          <Pager>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            <strong>
              Página {page}/{totalPages}
            </strong>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </button>
          </Pager>
        </>
      ) : (
        <>
          <ListWrap>
            {pageItems.map((b) => (
              <Row key={b._id}>
                <div
                  style={{
                    width: 72,
                    height: 96,
                    borderRadius: 8,
                    overflow: 'hidden',
                    background: '#eee',
                    position: 'relative'
                  }}
                >
                  {b.coverImage ? (
                    <img
                      src={b.coverImage}
                      alt={b.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'grid',
                        placeItems: 'center',
                        color: '#94a3b8',
                        fontSize: 12
                      }}
                    >
                      <ImageIcon size={18} />
                    </div>
                  )}
                </div>
                <RowMeta>
                  <div
                    style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}
                  >
                    <strong style={{ fontSize: 16 }}>{b.title}</strong>
                    <span style={{ color: '#64748b' }}>{b.category}</span>
                  </div>
                  <div className='syn'>
                    {b.synopsis?.slice(0, 160) || '—'}
                    {(b.synopsis || '').length > 160 ? '…' : ''}
                  </div>
                </RowMeta>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    as={Link}
                    $variant='ghost'
                    to={`/admin/books/${b._id}`}
                  >
                    <Eye size={16} /> Ver detalle
                  </Button>
                  <Button $variant='danger' onClick={() => onDelete(b._id)}>
                    <Trash2 size={16} /> Eliminar
                  </Button>
                </div>
              </Row>
            ))}
          </ListWrap>

          <Pager>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            <strong>
              Página {page}/{totalPages}
            </strong>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </button>
          </Pager>
        </>
      )}

      {/* Modal crear */}
      <Modal
        open={openCreate}
        title='Añadir libro'
        onClose={() => {
          setOpenCreate(false)
          // limpieza preview
          if (coverPreview) URL.revokeObjectURL(coverPreview)
          setCoverPreview('')
          setCoverFile(null)
        }}
        // footer fijo, botones accesibles
        footer={
          <>
            <Button
              $variant='ghost'
              onClick={() => {
                setOpenCreate(false)
                if (coverPreview) URL.revokeObjectURL(coverPreview)
                setCoverPreview('')
                setCoverFile(null)
              }}
            >
              Cancelar
            </Button>
            <Button
              disabled={savingCreate || !creating.author}
              onClick={saveCreate}
            >
              {savingCreate ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        }
      >
        {/* Contenido con altura controlada para evitar que tape el footer */}
        <div
          style={{
            display: 'grid',
            gap: 12,
            maxHeight: '65vh',
            overflowY: 'auto'
          }}
        >
          {!authors.length && (
            <Note>
              <AlertTriangle size={18} /> No hay autores. Primero añádelo en{' '}
              <Link
                to='/admin/authors'
                style={{
                  color: 'inherit',
                  textDecoration: 'underline',
                  marginLeft: 4
                }}
              >
                Autores
              </Link>
              .
            </Note>
          )}

          <label>
            Título *
            <input
              value={creating.title}
              onChange={(e) =>
                setCreating((s) => ({ ...s, title: e.target.value }))
              }
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border, #E2E8F0)',
                borderRadius: 10
              }}
            />
          </label>

          {/* Autor con buscador + botón Añadir autor */}
          <div>
            <div style={{ color: '#8a2be2', fontWeight: 700, marginBottom: 6 }}>
              Autor *
            </div>
            <FieldRow>
              <ComboWrap ref={comboRef}>
                <ComboInput
                  placeholder='Busca por nombre…'
                  value={authorQuery}
                  onChange={(e) => {
                    setAuthorQuery(e.target.value)
                    setComboOpen(true)
                  }}
                  onFocus={() => setComboOpen(true)}
                />
                <ComboSuffix>
                  <ChevronDown size={16} />
                </ComboSuffix>

                {comboOpen && (
                  <ComboList>
                    {authorsFiltered.length === 0 && (
                      <div style={{ padding: 10, color: '#64748b' }}>
                        Sin resultados
                      </div>
                    )}
                    {authorsFiltered.map((a) => (
                      <ComboItem
                        key={a._id}
                        onClick={() => {
                          setCreating((s) => ({ ...s, author: a._id }))
                          setAuthorQuery(a.name)
                          setComboOpen(false)
                        }}
                      >
                        {a.name}
                      </ComboItem>
                    ))}
                  </ComboList>
                )}
              </ComboWrap>

              <Button as={Link} to='/admin/authors' $variant='ghost'>
                Añadir nuevo autor
              </Button>
            </FieldRow>

            <div style={{ fontSize: 12, marginTop: 6, color: '#b45309' }}>
              Debe elegir un autor que ya esté guardado en la base de datos.
            </div>
          </div>

          <label>
            Categoría *
            <select
              value={creating.category}
              onChange={(e) =>
                setCreating((s) => ({ ...s, category: e.target.value }))
              }
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--border,#E2E8F0)',
                borderRadius: 10
              }}
            >
              <option value=''>Selecciona categoría…</option>
              {categoriesEnum.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label>
            Sinopsis *
            <textarea
              rows={4}
              value={creating.synopsis}
              onChange={(e) =>
                setCreating((s) => ({ ...s, synopsis: e.target.value }))
              }
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border, #E2E8F0)',
                borderRadius: 10
              }}
            />
          </label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
              gap: 8
            }}
          >
            <label>
              Precio blanda (€) *
              <input
                type='number'
                step='0.01'
                value={creating.priceSoft}
                onChange={(e) =>
                  setCreating((s) => ({ ...s, priceSoft: e.target.value }))
                }
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border,#E2E8F0)',
                  borderRadius: 10
                }}
              />
            </label>
            <label>
              Precio dura (€) *
              <input
                type='number'
                step='0.01'
                value={creating.priceHard}
                onChange={(e) =>
                  setCreating((s) => ({ ...s, priceHard: e.target.value }))
                }
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border,#E2E8F0)',
                  borderRadius: 10
                }}
              />
            </label>
            <label>
              Precio eBook (€) *
              <input
                type='number'
                step='0.1'
                value={creating.priceEbook}
                onChange={(e) =>
                  setCreating((s) => ({ ...s, priceEbook: e.target.value }))
                }
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border,#E2E8F0)',
                  borderRadius: 10
                }}
              />
            </label>
          </div>

          {/* Portada: URL O Archivo (archivo tiene prioridad si se sube) */}
          {/* <label>
            Portada (URL opcional)
            <input
              placeholder='https://…'
              value={creating.coverImage}
              onChange={(e) =>
                setCreating((s) => ({ ...s, coverImage: e.target.value }))
              }
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border, #E2E8F0)',
                borderRadius: 10
              }}
            />
          </label> */}

          <div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              O sube un archivo de portada
            </div>
            <input
              type='file'
              accept='image/*'
              onChange={(e) => {
                const file = e.target.files?.[0] || null
                setCoverFile(file)
                if (coverPreview) URL.revokeObjectURL(coverPreview)
                setCoverPreview(file ? URL.createObjectURL(file) : '')
              }}
            />
            {(coverPreview || creating.coverImage) && (
              <>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                  Vista previa
                </div>
                <PreviewBox>
                  <img
                    src={coverPreview || creating.coverImage}
                    alt='Portada'
                  />
                </PreviewBox>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  * Si eliges archivo, tendrá prioridad sobre la URL al guardar.
                </div>
              </>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}
