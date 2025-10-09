import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useNavigate, useParams } from 'react-router-dom'

import {
  getAuthor,
  updateAuthor,
  deleteAuthor,
  toggleAuthorFeatured,
  listBooksAll
} from '../../api/adminApi.js'
import { uploadAuthorPhoto } from '../../../../api/adminUpload.js'
import AuthorHeaderActions from '../../components/authors/authorsDet/AuthorHeaderActions.jsx'
import AuthorAvatarUploader from '../../components/authors/authorsDet/AuthorAvatarUploader.jsx'
import AuthorFormFields from '../../components/authors/authorsDet/AuthorFormFields.jsx'
import BooksGrid from '../../components/authors/authorsDet/BooksGrid.jsx'

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
      await updateAuthor(id, {
        name: model.name,
        biography: model.biography,
        featured: !!model.featured
      })
      if (newPhotoFile) await uploadAuthorPhoto(id, newPhotoFile)
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

  if (!author) return <div style={{ padding: 16 }}>Cargando…</div>

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
          {editing ? 'Editando autor' : 'Detalle de autor'}
        </h2>
        <AuthorHeaderActions
          editing={editing}
          saving={saving}
          featured={!!model.featured}
          onToggleFeatured={toggleFeatured}
          onEdit={() => setEditing(true)}
          onSave={save}
          onCancel={cancel}
          onDelete={remove}
        />
      </div>

      <Top>
        <AuthorAvatarUploader
          editing={editing}
          author={author}
          previewUrl={previewUrl}
          newPhotoFile={newPhotoFile}
          setNewPhotoFile={setNewPhotoFile}
          setPreviewUrl={setPreviewUrl}
        />
        <AuthorFormFields
          author={author}
          model={model}
          setModel={setModel}
          editing={editing}
        />
      </Top>

      <BooksGrid authorName={author.name} books={books} />
    </Wrap>
  )
}
