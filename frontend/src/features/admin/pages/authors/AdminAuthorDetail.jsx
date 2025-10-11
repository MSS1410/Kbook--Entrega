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
// layout vertical
const Top = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr);
  @media (min-width: 900px) {
    grid-template-columns: 260px minmax(0, 1fr);
  }
`
// 2 columnas en desktop, avatar form

export default function AdminAuthorDetail() {
  const { id } = useParams() // id de la ruta
  const navigate = useNavigate()
  const [author, setAuthor] = useState(null) // carga
  const [editing, setEditing] = useState(false) // habilitar o no edicion
  const [model, setModel] = useState({
    name: '',
    biography: '',
    photo: '',
    featured: false
  }) // modelo editado controlado

  const [newPhotoFile, setNewPhotoFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  const [saving, setSaving] = useState(false)
  const [books, setBooks] = useState([]) // libros del autor

  useEffect(() => {
    let alive = true // guard para evitar setState tras desmontar
    ;(async () => {
      const a = await getAuthor(id) // cargo auth
      if (!alive) return
      setAuthor(a)
      setModel({
        name: a?.name || '',
        biography: a?.biography || '',
        photo: a?.photo || '',
        featured: !!a?.featured
      })
      const allBooks = await listBooksAll() // traigo todos los lbros en filtro local
      if (!alive) return
      const mine = allBooks.filter((b) => {
        const auth = b.author // author puede venir como id o populado
        const aid = typeof auth === 'object' ? auth?._id : auth
        return String(aid) === String(id) // libros que autor === id actual
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
      }) // guardo datos tal cual
      if (newPhotoFile) await uploadAuthorPhoto(id, newPhotoFile) // si hay foto la subo
      const fresh = await getAuthor(id) // recargo author fresh
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
        setPreviewUrl('') // limpieza de preview
      }
      setEditing(false) // modo lectura again
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
    }) // deshace cambios en el form
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl('')
    }
    setNewPhotoFile(null)
    setEditing(false)
  }

  const remove = async () => {
    if (!confirm('¿Eliminar este autor?')) return
    await deleteAuthor(id) // elimino del backend
    navigate('/admin/authors') // listado
  }

  const toggleFeatured = async () => {
    const res = await toggleAuthorFeatured(id, !model.featured) // API: toggle featured
    setModel((m) => ({ ...m, featured: !!res?.featured })) // pasado al front
    setAuthor((a) => (a ? { ...a, featured: !!res?.featured } : a)) // lo paso al elemento cargado
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
          // botones segun modo
          onCancel={cancel}
          onDelete={remove}
        />
      </div>

      <Top>
        {/* bloque foto + input file(edicion)  */}
        <AuthorAvatarUploader
          editing={editing}
          author={author}
          previewUrl={previewUrl}
          newPhotoFile={newPhotoFile}
          setNewPhotoFile={setNewPhotoFile}
          setPreviewUrl={setPreviewUrl}
        />
        {/* inputs de nombre bio // lectura */}
        <AuthorFormFields
          author={author}
          model={model}
          setModel={setModel}
          editing={editing}
        />
      </Top>
      {/* grid de related books */}
      <BooksGrid authorName={author.name} books={books} />
    </Wrap>
  )
}
