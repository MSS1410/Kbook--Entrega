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
  flex-wrap: wrap; /*  phone, permite que el toolbar baje a otra linea */
`

const GridWrap = styled.div`
  display: grid;
  gap: 12px;
  align-items: stretch;
  grid-template-columns: repeat(2, minmax(0, 1fr)); /* movil 2 col */
  @media (min-width: 480px) {
    grid-template-columns: repeat(3, minmax(0, 1fr)); /* 3 de ancho en movil */
  }
  @media (min-width: 700px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

const ListWrap = styled.div`
  display: grid;
  gap: 12px;
  /* “solo grid” movil y tablet bajo 1024  */
  @media (max-width: 1023px) {
    display: none;
  }
`

export default function AdminBooks() {
  const [books, setBooks] = useState([]) // fuente local de libros
  const [authors, setAuthors] = useState([]) // need para combo autor
  const [q, setQ] = useState('') // busuqeda por titulo
  const [category, setCategory] = useState('') // filtrado por categoria
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
  }) //modelo controlado
  const [savingCreate, setSavingCreate] = useState(false)
  const [coverFile, setCoverFile] = useState(null) // archivo de portada
  const [coverPreview, setCoverPreview] = useState('') // preview

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
    })() // carga inicial
  }, [])

  const filtered = useMemo(() => {
    let arr = [...books]
    if (q.trim()) {
      const s = q.trim().toLowerCase()
      // busqueda por titulo
      arr = arr.filter((b) => (b.title || '').toLowerCase().includes(s))
    }
    if (category)
      //filtrado categoria
      arr = arr.filter((b) => String(b.category) === String(category))
    return arr
  }, [books, q, category])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages])
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    // ventana paginada
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  const onDelete = async (id) => {
    if (!confirm('¿Eliminar este libro?')) return
    await deleteBook(id) //  borra en backend
    const all = await listBooksAll() // refetch para consistencia
    setBooks(all)
  }

  const openCreateModal = () => {
    setCreating({
      // limpia form
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
      // validacion de campos
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
      // crea el libro
      const created = await createBook(payload)
      // si hay archivo, lo sube como portada
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
      // refresj listado
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
            // resset de pagina al filtrar
          }}
          category={category}
          setCategory={(v) => {
            setCategory(v)
            setPage(1)
            // reset de pagina al cambiar de categoria
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
              // tarjeta compacta
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
              <BookRow key={b._id} b={b} onDelete={onDelete} /> // fila con sinopsis cortada si hace falta
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
          // inyecta combo already configurado
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
