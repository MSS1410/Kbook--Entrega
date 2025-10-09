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

export default function AdminAuthors() {
  const [authors, setAuthors] = useState([])
  const [q, setQ] = useState('')
  const [view, setView] = useState('grid') // grid | list
  const [loading, setLoading] = useState(true)
  const [sortAZ, setSortAZ] = useState(true)

  const pageSize = 12
  const [page, setPage] = useState(1)
  useScrollToTopOn(page, q)

  // modal crear
  const [openCreate, setOpenCreate] = useState(false)
  const [creating, setCreating] = useState({
    name: '',
    biography: '',
    featured: false
  })
  const [creatingPhotoFile, setCreatingPhotoFile] = useState(null)
  const [creatingPreviewUrl, setCreatingPreviewUrl] = useState('')
  const [savingCreate, setSavingCreate] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const allAuthors = await listAuthorsAll()
        setAuthors(Array.isArray(allAuthors) ? allAuthors : [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(
    () => () => {
      if (creatingPreviewUrl) URL.revokeObjectURL(creatingPreviewUrl)
    },
    [creatingPreviewUrl]
  )

  const filtered = useMemo(() => {
    let arr = [...authors]
    if (q.trim()) {
      const s = q.trim().toLowerCase()
      arr = arr.filter((a) => (a.name || '').toLowerCase().includes(s))
    }
    arr.sort((a, b) => {
      const na = (a.name || '').toLowerCase(),
        nb = (b.name || '').toLowerCase()
      return sortAZ ? na.localeCompare(nb) : nb.localeCompare(na)
    })
    return arr
  }, [authors, q, sortAZ])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
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
    await deleteAuthor(id)
    const all = await listAuthorsAll()
    setAuthors(all)
  }

  const openCreateModal = () => {
    setCreating({ name: '', biography: '', featured: false })
    setCreatingPhotoFile(null)
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
        name: creating.name.trim(),
        biography: creating.biography?.trim() || '',
        featured: !!creating.featured
      })
      if (created?._id && creatingPhotoFile) {
        await uploadAuthorPhoto(created._id, creatingPhotoFile)
      }
      const all = await listAuthorsAll()
      setAuthors(all)
      setOpenCreate(false)
      setCreating({ name: '', biography: '', featured: false })
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
        <h2 style={{ fontSize: 22 }}>Autores</h2>
        <AuthorsToolbar
          q={q}
          setQ={(v) => {
            setQ(v)
            setPage(1)
          }}
          sortAZ={sortAZ}
          setSortAZ={setSortAZ}
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
            {pageItems.map((a) => (
              <AuthorCard key={a._id} a={a} onDelete={onDelete} />
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

      <CreateAuthorModal
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
