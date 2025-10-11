import React from 'react'
import styled, { useTheme } from 'styled-components'
import { Link } from 'react-router-dom'
import HomeCarrusel from '../../../../../../components/carrouseles/HomeCarrusels'

const SectionTitle = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  font-size: ${({ theme }) => theme.fontSizes.xl};
`
const GhostLink = styled(Link)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 600;
  display: inline-block;
`
// carrusel mas del autor, mostramos los libros si tiene, en el web
export default function AuthorMore({ author, authorBooks = [] }) {
  const theme = useTheme()
  if (!author?._id) return null

  return (
    <>
      <SectionTitle>Conoce más de {author?.name || 'este autor'}</SectionTitle>

      {authorBooks.length > 0 && (
        <HomeCarrusel
          title={`Más de ${author?.name || ''}`}
          items={authorBooks.map((b) => ({
            id: b._id,
            link: `/books/${b._id}`,
            component: (
              <img
                src={
                  b.coverImage ||
                  'https://via.placeholder.com/160x240?text=Libro'
                }
                alt={b.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: theme.radii.sm
                }}
              />
            )
          }))}
          viewAllLink={`/authors/${author._id}`}
          itemWidth={160}
          itemHeight={240}
          viewAllLabel='Ver más'
        />
      )}

      <div style={{ marginTop: theme.spacing.md }}>
        <GhostLink to={`/authors/${author._id}`}>
          Conoce a {author.name}
        </GhostLink>
      </div>
    </>
  )
}
