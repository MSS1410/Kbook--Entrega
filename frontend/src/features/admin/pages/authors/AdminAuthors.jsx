import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import useScrollToTopOn from '../../../../hooks/useScrollToTopOn'

import {
  listAuthorsAll,
  createAuthor,
  deleteAuthor
} from '../../api/adminApi.js'
import { uploadAuthorPhoto } from '../../../../api/adminUpload.js'

import AuthorsToolbar from '../../components/authors/authorsAdmin/AuthorsToolBar.jsx'
import AuthorCard from '../../components/authors/authorsAdmin/AuthorCard.jsx'
import AuthorRow from '../../components/authors/authorsAdmin/AuthorRow.jsx'
import Pagination from '../../components/authors/authorsAdmin/Pagination.jsx'
import CreateAuthorModal from '../../components/authors/authorsAdmin/CreateAuthorModal.jsx'

const HeadRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`
const GridWrap = styled.div`
  display: grid;
  gap: 12px;
  align-items: stretch;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  @media (min-width: 480px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`
const ListWrap = styled.div`
  display: grid;
  gap: 12px;
  @media (max-width: 1023px) {
    display: none;
  }
`

export default function AdminAuthors() {
  const [authors, setAuthors] = useState([]) // state fuente, lista de autores

  const [q, setQ] = useState('') // control nbusqueda
  const [view, setView] = useState('grid') // grid | list
  const [loading, setLoading] = useState(true)
  const [sortAZ, setSortAZ] = useState(true) //orden

  const pageSize = 12 //  tamaño pagina fijo UI
  const [page, setPage] = useState(1) // pag actual
  useScrollToTopOn(page, q) // sroll up

  // modal crear
  const [openCreate, setOpenCreate] = useState(false)
  const [creating, setCreating] = useState({
    name: '',
    biography: '',
    featured: false
  })
  // modelo controlado de formulario
  const [creatingPhotoFile, setCreatingPhotoFile] = useState(null) // selected archive img
  const [creatingPreviewUrl, setCreatingPreviewUrl] = useState('') // url preview
  const [savingCreate, setSavingCreate] = useState(false) // spinner save

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const allAuthors = await listAuthorsAll() // fetch authors, pag interno
        setAuthors(Array.isArray(allAuthors) ? allAuthors : [])
      } finally {
        setLoading(false) // apago loader
      }
    })()
  }, []) // carga inicial

  useEffect(
    () => () => {
      if (creatingPreviewUrl) URL.revokeObjectURL(creatingPreviewUrl) // evitar leaks del objectUrl
    },
    [creatingPreviewUrl]
  )

  const filtered = useMemo(() => {
    let arr = [...authors]
    if (q.trim()) {
      const s = q.trim().toLowerCase()
      arr = arr.filter((a) => (a.name || '').toLowerCase().includes(s)) // busqueda por nombre case-insensitive
    }
    arr.sort((a, b) => {
      const na = (a.name || '').toLowerCase(),
        nb = (b.name || '').toLowerCase()
      return sortAZ ? na.localeCompare(nb) : nb.localeCompare(na) // orden AZ / ZA
    })
    return arr
  }, [authors, q, sortAZ]) //recalculo solo si cambian deps

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize)) // numero de paginas minimo
  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages])

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  const onDelete = async (id) => {
    if (!confirm('¿Eliminar este autor? Esta acción no se puede deshacer.'))
      return
    await deleteAuthor(id) // borra en backend
    const all = await listAuthorsAll() // refetch consistencia
    setAuthors(all) // actualizamos fuente local
  }

  const openCreateModal = () => {
    setCreating({ name: '', biography: '', featured: false }) // clean
    setCreatingPhotoFile(null) // clean img
    if (creatingPreviewUrl) {
      URL.revokeObjectURL(creatingPreviewUrl)
      setCreatingPreviewUrl('')
    }
    setOpenCreate(true)
  }

  const saveCreate = async () => {
    if (!creating.name.trim()) {
      alert('El nombre es obligatorio.')
      return
    }
    setSavingCreate(true)
    try {
      const created = await createAuthor({
        // crea author
        name: creating.name.trim(),
        biography: creating.biography?.trim() || '',
        featured: !!creating.featured
      })
      if (created?._id && creatingPhotoFile) {
        await uploadAuthorPhoto(created._id, creatingPhotoFile) // si hay foto, la sube enpoint media
      }
      const all = await listAuthorsAll()
      setAuthors(all)
      setOpenCreate(false) // cierra modal
      setCreating({ name: '', biography: '', featured: false }) // reset form
      if (creatingPreviewUrl) {
        URL.revokeObjectURL(creatingPreviewUrl)
        setCreatingPreviewUrl('')
      }
      setCreatingPhotoFile(null)
    } catch (e) {
      console.error(e)
      alert(
        'No se pudo crear el autor. ' +
          (e?.response?.data?.message || e.message)
      )
    } finally {
      setSavingCreate(false)
    }
  }

  return (
    <>
      <HeadRow>
        {/* titulo */}
        <h2 style={{ fontSize: 22 }}>Autores</h2>
        <AuthorsToolbar
          q={q}
          setQ={(v) => {
            setQ(v) // actualiza filtro
            setPage(1) // reset d pagina tras filtrar
          }}
          sortAZ={sortAZ}
          setSortAZ={setSortAZ}
          view={view}
          setView={setView}
          onAdd={openCreateModal} // boton añadir autor
        />
      </HeadRow>

      {loading ? (
        <div style={{ padding: 16 }}>Cargando…</div>
      ) : pageItems.length === 0 ? (
        <div style={{ padding: 16, color: '#64748b' }}>Sin resultados.</div>
      ) : view === 'grid' ? ( // vista grid
        <>
          <GridWrap>
            {pageItems.map((a) => (
              <AuthorCard key={a._id} a={a} onDelete={onDelete} />
              // tarjeta de acciones
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
            {/* rama de vista lista */}
            {pageItems.map((a) => (
              <AuthorRow key={a._id} a={a} onDelete={onDelete} />
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

      <CreateAuthorModal // modal controlado para crear autor
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        creating={creating}
        setCreating={setCreating}
        file={creatingPhotoFile}
        setFile={setCreatingPhotoFile}
        previewUrl={creatingPreviewUrl}
        setPreviewUrl={setCreatingPreviewUrl}
        saving={savingCreate}
        onSave={saveCreate}
      />
    </>
  )
}
