// frontend/src/admin/pages/reviews/TopBooksChips.jsx
import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { absUrl } from '../../../../../utils/absUrl'
import { AVATAR_PLACEHOLDER } from '../../../../../constants/media'
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
const Cover = styled.img`
  width: 44px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  background: #f1f1f1;
`
const Badge = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`

export default function TopBooksChips({ topBooks, loading }) {
  return (
    <Section>
      <Head>
        <div>
          <h3 style={{ margin: 0 }}>Libros con más reseñas</h3>
          <small>Top interacción</small>
        </div>
      </Head>
      {loading ? (
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
                src={absUrl(b.coverImage || '') || AVATAR_PLACEHOLDER}
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
  )
}
