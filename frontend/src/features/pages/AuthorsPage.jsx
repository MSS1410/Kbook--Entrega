// frontend/src/features/pages/AuthorsPage.jsx
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import api from '../../api'
import { Link } from 'react-router-dom'

const Wrap = styled.div`
  max-width: 1100px;
  margin: 2rem auto;
  padding: ${({ theme }) => theme.spacing.lg};
`
const H1 = styled.h1`
  margin: 0 0 12px 0;
`
const Sub = styled.div`
  color: #666;
  margin-bottom: 16px;
`

const Card = styled.article`
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 16px;
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 16px;
  margin-bottom: 16px;
`
const Photo = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 12px;
  object-fit: cover;
  background: #eee;
`
const Name = styled.h3`
  margin: 0 0 6px 0;
`
const Bio = styled.p`
  margin: 0;
  line-height: 1.45;
  color: #333;
`

/* carrusel horizontal de libros */
const Shelf = styled.div`
  grid-column: 1 / -1;
  margin-top: 12px;
`
const ShelfHeader = styled.div`
  font-weight: 700;
  margin-bottom: 8px;
`
const Strip = styled.div`
  display: flex;
  gap: 12px;
  overflow: auto;
  padding-bottom: 4px;
`
const Book = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-decoration: none;
  color: inherit;
  min-width: 100px;
`
const Cover = styled.img`
  width: 100px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  background: #f0f0f0;
`
const Title = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  max-height: 2.6em;
  overflow: hidden;
`

/* paginación simple con el estilo que ya usamos */
const Pager = styled.nav`
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 18px;
  flex-wrap: wrap;
`
const Btn = styled.button`
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid #e6e6e8;
  background: ${({ active }) => (active ? '#111' : '#fff')};
  color: ${({ active }) => (active ? '#fff' : '#333')};
  font-weight: 700;
  cursor: pointer;
  &:hover {
    background: ${({ active }) => (active ? '#111' : '#f6f6fa')};
  }
`

export default function AuthorsPage() {
  const [authors, setAuthors] = useState([])
  const [byAuthorBooks, setByAuthorBooks] = useState({}) // { authorId: [books] }
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 5
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total]
  )

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.get('/api/authors', {
          params: { page, limit }
        })
        // si tu endpoint actual devuelve un array "a secas"
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.authors)
          ? data.authors
          : []
        setAuthors(list)
        // si no mandas total, estimamos (opcional); ideal: que el backend devuelva {authors, total}
        setTotal(
          typeof data?.total === 'number'
            ? data.total
            : page === 1 && list.length < limit
            ? list.length
            : limit * 20
        ) // fallback tosco

        // Cargar libros por autor en paralelo
        const pairs = await Promise.all(
          list.map(async (a) => {
            try {
              // primero por id
              const r1 = await api.get('/api/books', {
                params: { author: a._id, limit: 20 }
              })
              let books = Array.isArray(r1.data?.books)
                ? r1.data.books
                : Array.isArray(r1.data)
                ? r1.data
                : []
              // fallback por nombre si fuese necesario
              if (!books.length && a.name) {
                const r2 = await api.get('/api/books', {
                  params: { authorName: a.name, limit: 20 }
                })
                books = Array.isArray(r2.data?.books)
                  ? r2.data.books
                  : Array.isArray(r2.data)
                  ? r2.data
                  : []
              }
              return [a._id, books]
            } catch {
              return [a._id, []]
            }
          })
        )
        setByAuthorBooks(Object.fromEntries(pairs))
      } catch (e) {
        console.error(e)
        setAuthors([])
        setByAuthorBooks({})
      }
    })()
  }, [page])

  return (
    <Wrap>
      <H1>Autores</H1>
      <Sub>
        {total} autores · Mostrando {(page - 1) * limit + 1}–
        {(page - 1) * limit + authors.length}
      </Sub>

      {authors.map((a) => {
        const photo = a.photo || 'https://via.placeholder.com/120'
        const bio =
          a.biography && a.biography.trim()
            ? a.biography
            : 'Sin biografía disponible'
        const books = byAuthorBooks[a._id] || []
        return (
          <Card key={a._id}>
            <Photo src={photo} alt={a.name} />
            <div>
              <Name>{a.name}</Name>
              <Bio>{bio}</Bio>
            </div>

            <Shelf>
              <ShelfHeader>Libros de {a.name}</ShelfHeader>
              <Strip>
                {books.length === 0 ? (
                  <div style={{ color: '#777' }}>Sin libros asociados</div>
                ) : (
                  books.map((b) => {
                    const cover =
                      b.coverImage || b.cover || b.coverImageUrl || ''
                    return (
                      <Book key={b._id} to={`/books/${b._id}`}>
                        <Cover
                          src={cover || 'https://via.placeholder.com/100x150'}
                          alt={b.title}
                        />
                        <Title>{b.title}</Title>
                      </Book>
                    )
                  })
                )}
              </Strip>
            </Shelf>
          </Card>
        )
      })}

      {totalPages > 1 && (
        <Pager>
          <Btn
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ‹
          </Btn>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .slice(
              Math.max(0, page - 3),
              Math.max(0, page - 3) + 7
            ) /* ventanita */
            .map((p) => (
              <Btn
                key={p}
                active={p === page}
                onClick={() => setPage(p)}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </Btn>
            ))}
          <Btn
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            ›
          </Btn>
        </Pager>
      )}
    </Wrap>
  )
}
