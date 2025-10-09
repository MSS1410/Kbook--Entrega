import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import Button from '../../components/Button.jsx'
import useScrollToTopOn from '../../../../hooks/useScrollToTopOn'
import { Link } from 'react-router-dom'

import {
  listBooksAll,
  createBook,
  deleteBook,
  listAuthorsAll
} from '../../api/adminApi.js'
import { uploadBookCover } from '../../../../api/adminUpload.js'

import BooksToolbar from '../../components/books/booksAdmin/BooksToolBar.jsx'
import BookCard from '../../components/books/booksAdmin/BookCard.jsx'
import BookRow from '../../components/books/booksAdmin/BookRow.jsx'
import Pagination from '../../components/books/booksAdmin/Pagination.jsx'
import AuthorCombo from '../../components/books/booksAdmin/AuthorCombo.jsx'
import CreateBookModal from '../../components/books/booksAdmin/CreateBookModal.jsx'

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
const GridWrap = styled.div`
  display: grid;
  gap: 16px;
  align-items: stretch;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  @media (min-width: 900px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`
const ListWrap = styled.div`
  display: grid;
  gap: 12px;
`

export default function AdminBooks() {
  const [books, setBooks] = useState([])
  const [authors, setAuthors] = useState([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [view, setView] = useState('grid')
  const [loading, setLoading] = useState(true)

  const pageSize = 12
  const [page, setPage] = useState(1)
  useScrollToTopOn(page, q, category)

  // modal crear
  const [openCreate, setOpenCreate] = useState(false)
  const [creating, setCreating] = useState({
    title: '',
    author: '',
    category: '',
    synopsis: '',
    coverImage: '',
    priceSoft: '',
    priceHard: '',
    priceEbook: ''
  })
  const [savingCreate, setSavingCreate] = useState(false)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')

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

  const filtered = useMemo(() => {
    let arr = [...books]
    if (q.trim()) {
      const s = q.trim().toLowerCase()
      arr = arr.filter((b) => (b.title || '').toLowerCase().includes(s))
    }
    if (category)
      arr = arr.filter((b) => String(b.category) === String(category))
    return arr
  }, [books, q, category])

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
    setOpenCreate(true)
  }

  const saveCreate = async () => {
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
    const exists = authors.some(
      (a) => String(a._id) === String(creating.author)
    )
    if (!exists) {
      alert('Debe elegir un autor que ya exista en la base de datos.')
      return
    }

    setSavingCreate(true)
    try {
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
        coverImage: creating.coverImage || '',
        formats
      }
      const created = await createBook(payload)

      if (created?._id && coverFile) {
        try {
          await uploadBookCover(created._id, coverFile)
        } catch (e) {
          console.error(e)
          alert(
            'Libro creado pero la subida de portada ha fallado. Revisa el endpoint /api/admin/books/:id/cover.'
          )
        }
      }

      setOpenCreate(false)
      const all = await listBooksAll()
      setBooks(all)
    } finally {
      setSavingCreate(false)
      if (coverPreview) URL.revokeObjectURL(coverPreview)
      setCoverPreview('')
      setCoverFile(null)
    }
  }

  return (
    <>
      <HeadRow>
        <h2 style={{ fontSize: 22 }}>Biblioteca</h2>
        <BooksToolbar
          q={q}
          setQ={(v) => {
            setQ(v)
            setPage(1)
          }}
          category={category}
          setCategory={(v) => {
            setCategory(v)
            setPage(1)
          }}
          categoriesEnum={categoriesEnum}
          view={view}
          setView={setView}
          onAdd={openCreateModal}
        />
      </HeadRow>

      {loading ? (
        <div style={{ padding: 16 }}>Cargando…</div>
      ) : pageItems.length === 0 ? (
        <div style={{ padding: 16, color: '#64748b' }}>Sin resultados.</div>
      ) : view === 'grid' ? (
        <>
          <GridWrap>
            {pageItems.map((b) => (
              <BookCard key={b._id} b={b} onDelete={onDelete} />
            ))}
          </GridWrap>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </>
      ) : (
        <>
          <ListWrap>
            {pageItems.map((b) => (
              <BookRow key={b._id} b={b} onDelete={onDelete} />
            ))}
          </ListWrap>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </>
      )}

      <CreateBookModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        creating={creating}
        setCreating={setCreating}
        coverFile={coverFile}
        setCoverFile={setCoverFile}
        coverPreview={coverPreview}
        setCoverPreview={setCoverPreview}
        savingCreate={savingCreate}
        onSave={saveCreate}
        authors={authors}
        categoriesEnum={categoriesEnum}
        AuthorComboComp={
          <AuthorCombo
            authors={authors}
            value={creating.author}
            onChange={(id) => setCreating((s) => ({ ...s, author: id }))}
            extraButton={
              <Button as={Link} to='/admin/authors' $variant='ghost'>
                Añadir nuevo autor
              </Button>
            }
          />
        }
      />
    </>
  )
}
