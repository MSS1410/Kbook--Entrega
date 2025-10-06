import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import { listReviews, computeReviewStats } from '../../api/adminApi.js'

/* ======= UI base ======= */
const Wrap = styled.div`
  display: grid;
  gap: 24px;
`
const Head = styled.div`
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  h2 {
    font-size: 22px;
    line-height: 1.2;
    margin: 0;
  }
  small {
    color: ${({ theme }) => theme.colors.mutedText};
    display: block;
  }
`
const Section = styled.section`
  display: grid;
  gap: 12px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
`
const HScroll = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 280px;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 6px;
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 999px;
  }
`
const MiniCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr auto;
`
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
`
const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 999px;
  object-fit: cover;
  background: #eee;
`
const Cover = styled.img`
  width: 44px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  background: #f1f1f1;
`
const Title = styled.div`
  font-weight: 700;
  line-height: 1.25;
`
const Meta = styled.div`
  font-size: 12px;
  color: #64748b;
`
const Body = styled.div`
  padding: 0 12px 12px;
  font-size: 14px;
  color: #1f2937;
`
const Footer = styled.div`
  padding: 10px 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #475569;
`
const ChipsRow = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 6px;
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 999px;
  }
`
const Chip = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
  border-radius: 999px;
  text-decoration: none;
  color: inherit;
  white-space: nowrap;
  &:hover {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  }
`
const Badge = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`

/* ======= Helpers ======= */
const fmtDate = (iso) => new Date(iso).toLocaleDateString()

export default function AdminReviews() {
  const [latest, setLatest] = useState([])
  const [loadingLatest, setLoadingLatest] = useState(true)

  const [topUsers, setTopUsers] = useState([])
  const [topBooks, setTopBooks] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    // Últimas 15 reseñas
    ;(async () => {
      try {
        setLoadingLatest(true)
        const res = await listReviews({ page: 1, limit: 15 })
        setLatest(Array.isArray(res?.reviews) ? res.reviews : [])
      } finally {
        setLoadingLatest(false)
      }
    })()
    // Rankings (usuarios/libros)
    ;(async () => {
      try {
        setLoadingStats(true)
        const { topUsers, topBooks } = await computeReviewStats(5, 200)
        setTopUsers(topUsers.slice(0, 12))
        setTopBooks(topBooks.slice(0, 12))
      } finally {
        setLoadingStats(false)
      }
    })()
  }, [])

  const items = useMemo(
    () =>
      latest.map((r) => {
        const user = typeof r.user === 'object' ? r.user : null
        const book = typeof r.book === 'object' ? r.book : null
        return {
          id: r._id,
          rating: r.rating,
          comment: r.comment || '',
          createdAt: r.createdAt,
          userName: user?.name || 'Usuario',
          userAvatar: user?.avatar || '',
          userId: user?._id || '',
          bookTitle: book?.title || 'Libro',
          bookCover: book?.coverImage || '',
          bookId: book?._id || ''
        }
      }),
    [latest]
  )

  return (
    <>
      <Wrap>
        <Head>
          <div>
            <h2>Reseñas</h2>
            <small>Resumen y rankings</small>
          </div>
          {/* <- eliminado el botón duplicado aquí */}
        </Head>

        {/* Sección 1: carrusel de últimas 15 */}
        <Section>
          <Head style={{ padding: 0 }}>
            <div>
              <h3 style={{ margin: 0 }}>Últimas reseñas</h3>
              <small>Las 15 más recientes</small>
            </div>
            <Button as={Link} to='/admin/reviews/list' variant='ghost'>
              Ver todas
            </Button>
          </Head>

          {loadingLatest ? (
            <div style={{ padding: '8px 0' }}>Cargando…</div>
          ) : items.length === 0 ? (
            <div style={{ padding: '8px 0', color: '#64748b' }}>
              No hay reseñas.
            </div>
          ) : (
            <HScroll>
              {items.map((it) => (
                <MiniCard key={it.id} title={it.bookTitle}>
                  <Row>
                    <Avatar
                      src={
                        it.userAvatar ||
                        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
                      }
                      alt={it.userName}
                    />
                    <div style={{ minWidth: 0 }}>
                      <Title>{it.userName}</Title>
                      <Meta>{fmtDate(it.createdAt)}</Meta>
                    </div>
                  </Row>

                  <Body>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 6
                      }}
                    >
                      {it.bookCover ? (
                        <Cover src={it.bookCover} alt={it.bookTitle} />
                      ) : (
                        <Cover as='div' aria-label='Sin portada' />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, lineHeight: 1.2 }}>
                          {it.bookTitle}
                        </div>
                        <Meta>Valoración: {it.rating ?? '—'} / 5</Meta>
                      </div>
                    </div>
                    <div style={{ color: '#111827' }}>
                      {it.comment.length > 160
                        ? it.comment.slice(0, 160) + '…'
                        : it.comment}
                    </div>
                  </Body>

                  <Footer>
                    <Link to={`/admin/users/${it.userId}?tab=reviews`}>
                      Ver usuario
                    </Link>
                    <Link to={`/admin/books/${it.bookId}?tab=reviews`}>
                      Ver libro
                    </Link>
                  </Footer>
                </MiniCard>
              ))}
            </HScroll>
          )}
        </Section>

        {/* Sección 2: usuarios con más reseñas */}
        <Section>
          <Head style={{ padding: 0 }}>
            <div>
              <h3 style={{ margin: 0 }}>Usuarios con más reseñas</h3>
              <small>Top actividad</small>
            </div>
          </Head>
          {loadingStats ? (
            <div style={{ padding: '8px 0' }}>Cargando…</div>
          ) : topUsers.length === 0 ? (
            <div style={{ padding: '8px 0', color: '#64748b' }}>Sin datos.</div>
          ) : (
            <ChipsRow>
              {topUsers.map((u) => (
                <Chip
                  key={u.id}
                  to={`/admin/users/${u.id}?tab=reviews`}
                  title={`${u.name} (${u.count})`}
                >
                  <Avatar
                    src={
                      u.avatar ||
                      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
                    }
                    alt={u.name}
                  />
                  <span>{u.name}</span>
                  <Badge>· {u.count}</Badge>
                </Chip>
              ))}
            </ChipsRow>
          )}
        </Section>

        {/* Sección 3: libros con más reseñas */}
        <Section>
          <Head style={{ padding: 0 }}>
            <div>
              <h3 style={{ margin: 0 }}>Libros con más reseñas</h3>
              <small>Top interacción</small>
            </div>
          </Head>
          {loadingStats ? (
            <div style={{ padding: '8px 0' }}>Cargando…</div>
          ) : topBooks.length === 0 ? (
            <div style={{ padding: '8px 0', color: '#64748b' }}>Sin datos.</div>
          ) : (
            <ChipsRow>
              {topBooks.map((b) => (
                <Chip
                  key={b.id}
                  to={`/admin/books/${b.id}?tab=reviews`}
                  title={`${b.title} (${b.count})`}
                >
                  <Cover
                    src={
                      b.coverImage ||
                      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
                    }
                    alt={b.title}
                  />
                  <span
                    style={{
                      maxWidth: 280,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {b.title}
                  </span>
                  <Badge>· {b.count}</Badge>
                </Chip>
              ))}
            </ChipsRow>
          )}
        </Section>
      </Wrap>
    </>
  )
}
