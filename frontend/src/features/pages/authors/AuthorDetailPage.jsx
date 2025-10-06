// frontend/src/features/pages/authors/AuthorDetailPage.jsx
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import api from '../../../api'
import HomeCarrusel from '../../../components/carrouseles/HomeCarrusels'

const Page = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 ${({ theme }) => theme.spacing.lg};
`

const Header = styled.div`
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  align-items: center;
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`

const Avatar = styled.img`
  width: 160px;
  height: 160px;
  border-radius: 999px;
  object-fit: cover;
  background: #f0f0f0;
  justify-self: center;
`

const Name = styled.h1`
  margin: 0 0 6px 0;
  font-size: ${({ theme }) => theme.fontSizes.xxl};
`

const Bio = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.onSurface};
  line-height: 1.6;
`

const BackRow = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-weight: 600;
  }
`

export default function AuthorDetailPage() {
  const { id } = useParams()
  const [author, setAuthor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const { data } = await api.get(`/api/authors/${id}`)
        if (!cancelled) setAuthor(data)
      } catch (e) {
        if (!cancelled) setError('No se pudo cargar el autor.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading)
    return (
      <Page>
        <p>Cargando autor…</p>
      </Page>
    )
  if (error)
    return (
      <Page>
        <p>{error}</p>
      </Page>
    )
  if (!author)
    return (
      <Page>
        <p>Autor no encontrado.</p>
      </Page>
    )

  const photo = author.photo || 'https://via.placeholder.com/280x280?text=Autor'
  const books = Array.isArray(author.books) ? author.books : []

  return (
    <Page>
      <Header>
        <Avatar
          src={photo}
          alt={author.name}
          onError={(e) => {
            if (!e.currentTarget.dataset.fallback) {
              e.currentTarget.dataset.fallback = '1'
              e.currentTarget.src =
                'https://via.placeholder.com/280x280?text=Autor'
            }
          }}
        />
        <div>
          <Name>{author.name}</Name>
          {author.biography ? (
            <Bio>{author.biography}</Bio>
          ) : (
            <Bio>Este autor todavía no tiene biografía disponible.</Bio>
          )}
          <BackRow>
            <Link to='/authors'>← Volver a autores</Link>
          </BackRow>
        </div>
      </Header>

      <div style={{ marginTop: 24 }}>
        {books.length > 0 ? (
          <HomeCarrusel
            title={`Libros de ${author.name}`}
            items={books.map((b) => ({
              id: b._id,
              link: `/books/${b._id}`,
              component: (
                <img
                  src={
                    b.coverImage ||
                    'https://via.placeholder.com/160x240?text=Libro'
                  }
                  alt={b.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )
            }))}
            viewAllLink={`/books?search=${encodeURIComponent(author.name)}`}
            itemWidth={160}
            itemHeight={240}
            itemGap={10}
          />
        ) : (
          <p style={{ color: '#666' }}>
            Todavía no tenemos libros de este autor en el catálogo.
          </p>
        )}
      </div>
    </Page>
  )
}
