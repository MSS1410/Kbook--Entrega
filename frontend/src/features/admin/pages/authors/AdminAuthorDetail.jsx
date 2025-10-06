import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Link, useNavigate, useParams } from 'react-router-dom'

import Button from '../../components/Button.jsx'
import {
  getAuthor,
  updateAuthor,
  deleteAuthor,
  toggleAuthorFeatured,
  listBooksAll
} from '../../api/adminApi.js'
import { uploadAuthorPhoto } from '../../../../api/adminUpload.js'
import { Pencil, Save, X, Trash2, Star } from 'lucide-react'

const Wrap = styled.div`
  display: grid;
  gap: 16px;
`
const Top = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr);
  @media (min-width: 900px) {
    grid-template-columns: 260px minmax(0, 1fr);
  }
`
const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  overflow: hidden;
`
const Block = styled(Card)`
  padding: 16px;
  display: grid;
  gap: 10px;
`
const Avatar = styled.div`
  position: relative;
  width: 100%;
  background: #eee;
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
const Field = styled.label`
  display: grid;
  gap: 6px;
`
const FieldLabel = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
`

const GridBooks = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  @media (min-width: 900px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`
const BookCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.cardBg};
`
const BookCover = styled.div`
  position: relative;
  width: 100%;
  background: #eee;
  &::before {
    content: '';
    display: block;
    padding-bottom: 133.333%;
  } /* 3:4 */
  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`
const BookBody = styled.div`
  padding: 10px;
  font-size: 14px;
  display: grid;
  gap: 6px;
`
const BookTitle = styled.div`
  font-weight: 600;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: calc(1.25em * 2);
`

export default function AdminAuthorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [author, setAuthor] = useState(null)
  const [editing, setEditing] = useState(false)
  const [model, setModel] = useState({
    name: '',
    biography: '',
    photo: '',
    featured: false
  })

  // Foto nueva (archivo) + preview
  const [newPhotoFile, setNewPhotoFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  const [saving, setSaving] = useState(false)
  const [books, setBooks] = useState([])

  useEffect(() => {
    let alive = true
    ;(async () => {
      const a = await getAuthor(id)
      if (!alive) return
      setAuthor(a)
      setModel({
        name: a?.name || '',
        biography: a?.biography || '',
        photo: a?.photo || '',
        featured: !!a?.featured
      })
      // Libros del autor (filtrado en cliente)
      const allBooks = await listBooksAll()
      if (!alive) return
      const mine = allBooks.filter((b) => {
        const auth = b.author
        const aid = typeof auth === 'object' ? auth?._id : auth
        return String(aid) === String(id)
      })
      setBooks(mine)
    })()
    return () => {
      alive = false
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [id])

  const save = async () => {
    setSaving(true)
    try {
      // 1) Actualizamos datos (sin tocar photo directamente)
      await updateAuthor(id, {
        name: model.name,
        biography: model.biography,
        featured: !!model.featured
      })

      // 2) Si hay archivo, lo subimos
      if (newPhotoFile) {
        await uploadAuthorPhoto(id, newPhotoFile)
      }

      // 3) Refrescamos
      const fresh = await getAuthor(id)
      setAuthor(fresh)
      setModel({
        name: fresh.name || '',
        biography: fresh.biography || '',
        photo: fresh.photo || '',
        featured: !!fresh.featured
      })
      setNewPhotoFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl('')
      }
      setEditing(false)
    } catch (e) {
      console.error(e)
      alert(
        'No se pudo guardar los cambios del autor. ' +
          (e?.response?.data?.message || e.message)
      )
    } finally {
      setSaving(false)
    }
  }

  const cancel = () => {
    if (!author) return
    setModel({
      name: author.name || '',
      biography: author.biography || '',
      photo: author.photo || '',
      featured: !!author.featured
    })
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl('')
    }
    setNewPhotoFile(null)
    setEditing(false)
  }

  const remove = async () => {
    if (!confirm('¿Eliminar este autor?')) return
    await deleteAuthor(id)
    navigate('/admin/authors')
  }

  const toggleFeatured = async () => {
    const res = await toggleAuthorFeatured(id, !model.featured)
    setModel((m) => ({ ...m, featured: !!res?.featured }))
    setAuthor((a) => (a ? { ...a, featured: !!res?.featured } : a))
  }

  if (!author) {
    return <div style={{ padding: 16 }}>Cargando…</div>
  }

  return (
    <>
      <Wrap>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h2 style={{ fontSize: 22 }}>
            {editing ? 'Editando autor' : 'Detalle de autor'}
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button $variant='ghost' onClick={toggleFeatured}>
              <Star size={16} />{' '}
              {model.featured ? 'Quitar destacado' : 'Marcar destacado'}
            </Button>
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
            <Avatar>
              {(previewUrl || author.photo) && (
                <img src={previewUrl || author.photo} alt={author.name} />
              )}
            </Avatar>

            {editing && (
              <div
                style={{
                  padding: 12,
                  borderTop: '1px solid var(--border,#E2E8F0)'
                }}
              >
                <Field>
                  <FieldLabel>Nueva foto (archivo)</FieldLabel>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      setNewPhotoFile(file)
                      // preview
                      if (previewUrl) {
                        URL.revokeObjectURL(previewUrl)
                        setPreviewUrl('')
                      }
                      if (file) {
                        const url = URL.createObjectURL(file)
                        setPreviewUrl(url)
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
                  {newPhotoFile && (
                    <small style={{ color: '#64748b' }}>
                      {newPhotoFile.name} •{' '}
                      {(newPhotoFile.size / 1024).toFixed(1)} KB
                    </small>
                  )}
                </Field>
              </div>
            )}
          </Card>

          <Block>
            <Field>
              <FieldLabel>Nombre</FieldLabel>
              {editing ? (
                <input
                  value={model.name}
                  onChange={(e) =>
                    setModel((m) => ({ ...m, name: e.target.value }))
                  }
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border,#E2E8F0)',
                    borderRadius: 10
                  }}
                />
              ) : (
                <div>{author.name || '—'}</div>
              )}
            </Field>

            <Field>
              <FieldLabel>Biografía</FieldLabel>
              {editing ? (
                <textarea
                  rows={6}
                  value={model.biography}
                  onChange={(e) =>
                    setModel((m) => ({ ...m, biography: e.target.value }))
                  }
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border,#E2E8F0)',
                    borderRadius: 10
                  }}
                />
              ) : (
                <div>{author.biography || '—'}</div>
              )}
            </Field>
          </Block>
        </Top>

        <Block>
          <strong>Libros de {author.name}</strong>
          {books.length ? (
            <GridBooks>
              {books.map((b) => (
                <BookCard key={b._id}>
                  <BookCover>
                    {b.coverImage ? (
                      <img src={b.coverImage} alt={b.title} />
                    ) : null}
                  </BookCover>
                  <BookBody>
                    <BookTitle>{b.title}</BookTitle>
                    <Button
                      as={Link}
                      $variant='ghost'
                      to={`/admin/books/${b._id}`}
                      style={{ justifySelf: 'start' }}
                    >
                      Ver libro
                    </Button>
                  </BookBody>
                </BookCard>
              ))}
            </GridBooks>
          ) : (
            <div style={{ color: '#64748b' }}>
              Este autor no tiene libros asociados.
            </div>
          )}
        </Block>
      </Wrap>
    </>
  )
}
