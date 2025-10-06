import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import useScrollToTopOn from '../../../../hooks/useScrollToTopOn' // 👈 NUEVO

import Button from '../../components/Button.jsx'
import Modal from '../../components/Modal.jsx'
import {
  listAuthorsAll,
  createAuthor,
  deleteAuthor
} from '../../api/adminApi.js'
import { uploadAuthorPhoto } from '../../../../api/adminUpload.js'
import {
  Search,
  Plus,
  Trash2,
  Eye,
  Grid,
  List,
  ArrowUpAZ,
  ArrowDownAZ
} from 'lucide-react'

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

/* GRID */
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
const Avatar = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #eee;
  flex: 0 0 auto;
  &::before {
    content: '';
    display: block;
    padding-bottom: 100%;
  } /* 1:1 */
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
const Name = styled.h3`
  font-size: 15px;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: calc(1.25em * 2);
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

/* LIST */
const ListWrap = styled.div`
  display: grid;
  gap: 12px;
`
const Row = styled.div`
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;

  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  padding: 8px;
  overflow: hidden;
`

const Bio = styled.div`
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 13px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

export default function AdminAuthors() {
  const [authors, setAuthors] = useState([])
  const [q, setQ] = useState('')
  const [view, setView] = useState('grid') // grid | list
  const [loading, setLoading] = useState(true)
  const [sortAZ, setSortAZ] = useState(true) // A-Z o Z-A

  // paginación UI
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

  useEffect(() => {
    return () => {
      if (creatingPreviewUrl) URL.revokeObjectURL(creatingPreviewUrl)
    }
  }, [creatingPreviewUrl])

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
      // 1) Creamos el autor SIN foto (el backend pondrá photo: '' por defecto)
      const created = await createAuthor({
        name: creating.name.trim(),
        biography: creating.biography?.trim() || '',
        featured: !!creating.featured
      })

      // 2) Si seleccionaron archivo, lo subimos
      if (created?._id && creatingPhotoFile) {
        await uploadAuthorPhoto(created._id, creatingPhotoFile)
      }

      // 3) Refrescamos listado
      const all = await listAuthorsAll()
      setAuthors(all)

      // 4) Cerramos modal + limpiamos
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
              placeholder='Buscar autores por nombre'
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <Button
            $variant='ghost'
            onClick={() => setSortAZ((v) => !v)}
            title={sortAZ ? 'Ordenar Z-A' : 'Ordenar A-Z'}
          >
            {sortAZ ? (
              <>
                <ArrowUpAZ size={16} /> A-Z
              </>
            ) : (
              <>
                <ArrowDownAZ size={16} /> Z-A
              </>
            )}
          </Button>

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
            <Plus size={16} /> Añadir autor
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
            {pageItems.map((a) => (
              <Card key={a._id}>
                <Avatar>
                  {a.photo ? <img src={a.photo} alt={a.name} /> : null}
                </Avatar>
                <CardBody>
                  <Name title={a.name}>{a.name}</Name>
                  <Actions>
                    <Button
                      as={Link}
                      $variant='ghost'
                      to={`/admin/authors/${a._id}`}
                    >
                      <Eye size={16} /> Ver detalle
                    </Button>
                    <Button $variant='danger' onClick={() => onDelete(a._id)}>
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
            {pageItems.map((a) => (
              <Row key={a._id}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 8,
                    overflow: 'hidden',
                    background: '#eee'
                  }}
                >
                  {a.photo ? (
                    <img
                      src={a.photo}
                      alt={a.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : null}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{a.name}</div>
                  {!!a.biography && <Bio>{a.biography}</Bio>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    as={Link}
                    $variant='ghost'
                    to={`/admin/authors/${a._id}`}
                  >
                    <Eye size={16} /> Ver detalle
                  </Button>
                  <Button $variant='danger' onClick={() => onDelete(a._id)}>
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
        title='Añadir autor'
        onClose={() => setOpenCreate(false)}
        footer={
          <>
            <Button $variant='ghost' onClick={() => setOpenCreate(false)}>
              Cancelar
            </Button>
            <Button disabled={savingCreate} onClick={saveCreate}>
              {savingCreate ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        }
      >
        <div
          style={{
            display: 'grid',
            gap: 12,
            maxHeight: '60vh',
            overflow: 'auto'
          }}
        >
          <label>
            Nombre *
            <input
              value={creating.name}
              onChange={(e) =>
                setCreating((s) => ({ ...s, name: e.target.value }))
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
            Biografía
            <textarea
              rows={4}
              value={creating.biography}
              onChange={(e) =>
                setCreating((s) => ({ ...s, biography: e.target.value }))
              }
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border,#E2E8F0)',
                borderRadius: 10
              }}
            />
          </label>

          <label>
            Foto (archivo)
            <input
              type='file'
              accept='image/*'
              onChange={(e) => {
                const f = e.target.files?.[0] || null
                setCreatingPhotoFile(f)
                if (creatingPreviewUrl) {
                  URL.revokeObjectURL(creatingPreviewUrl)
                  setCreatingPreviewUrl('')
                }
                if (f) {
                  const url = URL.createObjectURL(f)
                  setCreatingPreviewUrl(url)
                }
              }}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--border,#E2E8F0)',
                borderRadius: 10,
                background: '#fff'
              }}
            />
            {creatingPhotoFile && (
              <small style={{ color: '#64748b' }}>
                {creatingPhotoFile.name} •{' '}
                {(creatingPhotoFile.size / 1024).toFixed(1)} KB
              </small>
            )}
          </label>

          {creatingPreviewUrl && (
            <div
              style={{
                width: 160,
                aspectRatio: '1/1',
                borderRadius: 12,
                overflow: 'hidden',
                background: '#eee'
              }}
            >
              <img
                src={creatingPreviewUrl}
                alt='Previsualización'
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type='checkbox'
              checked={creating.featured}
              onChange={(e) =>
                setCreating((s) => ({ ...s, featured: e.target.checked }))
              }
            />
            Destacado
          </label>
        </div>
      </Modal>
    </>
  )
}
