// frontend/src/features/profile/ProfilePage.jsx
import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import api from '../../api/index'

const Container = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  padding: ${({ theme }) => theme.spacing.lg};

  display: grid;
  grid-template-columns: 280px 1fr;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

const Left = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const Right = styled.div`
  min-width: 320px;
`

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  margin-bottom: 0;
`

const AvatarWrapper = styled.div`
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f0f0;
`
const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`
const UploadInput = styled.input`
  display: none;
`

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.sm};
`

const Field = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`
const Label = styled.label`
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
`
const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid #ccc;
  border-radius: ${({ theme }) => theme.radii.sm};
`

const ToggleSection = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

/* Mis Libros */
const BooksCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  min-height: 0;
  ${({ $expanded }) => ($expanded ? 'flex: 1 1 auto;' : 'flex: 0 0 auto;')}
`

const BooksGrid = styled.ul`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
`
const BookItem = styled.li`
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
`
const BookCover = styled.img`
  width: 72px;
  height: 96px;
  object-fit: cover;
  border-radius: 8px;
  background: #f1f1f1;
`
const CoverBox = styled.div`
  width: 72px;
  height: 96px;
  border-radius: 8px;
  background: #eee;
`
const BookTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  line-height: 1.25;
  color: #111;
`
const BookMeta = styled.p`
  margin: 4px 0 0;
  color: #555;
  font-size: 14px;
`

/* Enlace “Ver todos” */
const SeeAllLink = styled(Link)`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: underline;
  &:hover {
    opacity: 0.9;
  }
`

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    city: user?.city || '',
    postalCode: user?.postalCode || '',
    country: user?.country || '',
    cardNumber: user?.cardNumber || '',
    expiry: user?.expiry || '',
    holderName: user?.holderName || ''
  })

  // Acordeón arranca cerrado
  const [showBooks, setShowBooks] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  // Mis Libros
  const [books, setBooks] = useState([])
  const [booksLoading, setBooksLoading] = useState(false)
  const [booksError, setBooksError] = useState(null)

  useEffect(() => {
    if (!showBooks || books.length || booksLoading) return
    ;(async () => {
      try {
        setBooksLoading(true)
        const { data } = await api.get('/api/users/profile/books')
        const arr = Array.isArray(data?.books) ? data.books : []
        setBooks(arr)
      } catch (e) {
        console.error(e)
        setBooksError('No pudimos cargar tus libros.')
      } finally {
        setBooksLoading(false)
      }
    })()
  }, [showBooks, books.length, booksLoading])

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = async () => {
    try {
      const res = await api.put('/api/users/profile', { ...form })
      setUser(res.data.user)
      alert('Perfil actualizado')
    } catch (e) {
      console.error(e)
      alert('Error guardando perfil')
    }
  }

  const handleAvatar = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const data = new FormData()
    data.append('avatar', file)
    setUploading(true)
    try {
      const res = await api.post('/api/users/profile/avatar', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUser((u) => ({ ...u, avatar: res.data.avatar }))
    } catch (err) {
      console.error(err)
      alert('Error subiendo avatar')
    } finally {
      setUploading(false)
    }
  }

  // 3 últimos
  const latestBooks = books.slice(0, 3)

  return (
    <Container>
      <Left>
        <Card>
          <h2>Perfil</h2>
          <AvatarWrapper>
            <AvatarImg
              src={
                user?.avatar || 'https://via.placeholder.com/160?text=Sin+foto'
              }
              alt={user?.name}
            />
          </AvatarWrapper>
          <div>{user?.name}</div>
          <div>{user?.email}</div>
          <Button onClick={() => fileRef.current.click()}>
            {uploading ? 'Subiendo...' : 'Cambiar foto'}
          </Button>
          <UploadInput
            ref={fileRef}
            type='file'
            accept='image/*'
            onChange={handleAvatar}
          />
        </Card>

        <BooksCard $expanded={showBooks}>
          <ToggleSection onClick={() => setShowBooks((s) => !s)}>
            <div style={{ fontWeight: 'bold' }}>Mis Libros</div>
            <div>{showBooks ? '▾' : '▸'}</div>
          </ToggleSection>

          {showBooks && (
            <>
              {booksLoading && <p>Cargando tus libros…</p>}
              {booksError && <p>{booksError}</p>}
              {!booksLoading && !booksError && latestBooks.length === 0 && (
                <p>Aquí aparecerán los libros que compraste.</p>
              )}

              {latestBooks.length > 0 && (
                <BooksGrid>
                  {latestBooks.map((b) => {
                    const src = b.cover || b.coverImage || b.coverImageUrl || ''
                    return (
                      <BookItem key={`${b._id}-${b.purchasedAt}`}>
                        {src ? (
                          <BookCover
                            src={src}
                            alt={`Portada de ${b.title}`}
                            onError={(e) =>
                              (e.currentTarget.style.visibility = 'hidden')
                            }
                          />
                        ) : (
                          <CoverBox aria-label='Sin portada' />
                        )}
                        <div>
                          <BookTitle>{b.title}</BookTitle>
                          <BookMeta>{b.author}</BookMeta>
                          <BookMeta>
                            Comprado el{' '}
                            {format(
                              new Date(b.purchasedAt),
                              "d 'de' MMMM yyyy",
                              {
                                locale: es
                              }
                            )}
                          </BookMeta>
                        </div>
                      </BookItem>
                    )
                  })}
                </BooksGrid>
              )}

              {/* Enlace de texto */}
              <div style={{ marginTop: 8, textAlign: 'right' }}>
                <SeeAllLink to='/my-books'>Ver todos</SeeAllLink>
              </div>
            </>
          )}
        </BooksCard>
      </Left>

      <Right>
        <Card>
          <h3>Información personal y envío</h3>
          <Field>
            <Label>Nombre</Label>
            <Input name='name' value={form.name} onChange={handleChange} />
          </Field>
          <Field>
            <Label>Email</Label>
            <Input
              name='email'
              value={form.email}
              disabled
              onChange={handleChange}
            />
          </Field>
          <Field>
            <Label>Dirección</Label>
            <Input
              name='address'
              value={form.address}
              onChange={handleChange}
            />
          </Field>
          <Field>
            <Label>Ciudad</Label>
            <Input name='city' value={form.city} onChange={handleChange} />
          </Field>
          <Field>
            <Label>Código postal</Label>
            <Input
              name='postalCode'
              value={form.postalCode}
              onChange={handleChange}
            />
          </Field>
          <Field>
            <Label>País</Label>
            <Input
              name='country'
              value={form.country}
              onChange={handleChange}
            />
          </Field>
        </Card>

        <Card>
          <h3>Información de pago</h3>
          <Field>
            <Label>Nombre titular</Label>
            <Input
              name='holderName'
              value={form.holderName}
              onChange={handleChange}
            />
          </Field>
          <Field>
            <Label>Número de tarjeta</Label>
            <Input
              name='cardNumber'
              value={form.cardNumber}
              onChange={handleChange}
            />
          </Field>
          <Field>
            <Label>Caducidad</Label>
            <Input name='expiry' value={form.expiry} onChange={handleChange} />
          </Field>
        </Card>

        <Button onClick={handleSave}>Guardar cambios</Button>
      </Right>
    </Container>
  )
}
