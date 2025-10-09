// frontend/src/admin/pages/reviews/LatestReviewsCarousel.jsx
import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import Button from '../../Button.jsx'
import { AVATAR_PLACEHOLDER } from '../../../../../constants/media.js'
import { absUrl } from '../../../../../utils/absUrl.js'
const Section = styled.section`
  display: grid;
  gap: 12px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
`
const Head = styled.div`
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
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

const fmtDate = (iso) => new Date(iso).toLocaleDateString()

export default function LatestReviewsCarousel({ items, loading }) {
  return (
    <Section>
      <Head>
        <div>
          <h3 style={{ margin: 0 }}>Últimas reseñas</h3>
          <small>Las 15 más recientes</small>
        </div>
        <Button as={Link} to='/admin/reviews/list' variant='ghost'>
          Ver todas
        </Button>
      </Head>

      {loading ? (
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
                  src={absUrl(it.coverImage || '') || AVATAR_PLACEHOLDER}
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
  )
}
