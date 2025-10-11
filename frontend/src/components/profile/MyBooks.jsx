// frontend/src/components/profile/MyBooks.jsx
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import api from '../../api'
import { Link } from 'react-router-dom'

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
`
const Toggle = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
`
const Grid = styled.ul`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
`
const Item = styled.li`
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
const Cover = styled.img`
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
const Title = styled.h4`
  margin: 0;
  font-size: 16px;
  line-height: 1.25;
  color: #111;
`
const Meta = styled.p`
  margin: 4px 0 0;
  color: #555;
  font-size: 14px;
`
const SeeAll = styled(Link)`
  justify-self: end;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: underline;
`
// acordeon, al abrirse, fetch de mis libros, ordena y muestra los 3 recientes
export default function BooksAccordion({ open: controlledOpen, onToggle }) {
  const [internalOpen, setInternalOpen] = useState(false)
  // control de apertura de acordeon
  const open = controlledOpen ?? internalOpen
  const toggle = onToggle ?? (() => setInternalOpen((o) => !o))

  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false) //  evita refetch infinito con lista vacía
  const [books, setBooks] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open) return
    if (loading || loaded) return
    ;(async () => {
      try {
        setLoading(true)
        const { data } = await api.get('/api/users/profile/books')
        const list = Array.isArray(data?.books) ? data.books : []
        setBooks(list)
      } catch {
        setError('No pudimos cargar tus libros.')
      } finally {
        setLoading(false)
        setLoaded(true) // haya libros o no lo marco siempre como cargado
      }
    })()
  }, [open, loading, loaded])

  // orden por fecha de compra desc y tomamos 3 ultimos
  const latest = useMemo(
    () =>
      [...books]
        .sort(
          (a, b) =>
            +new Date(b.purchasedAt || 0) - +new Date(a.purchasedAt || 0)
        )
        .slice(0, 3),
    [books]
  )

  return (
    <Card>
      {/* seccion donde se expande tras el click */}
      <Toggle onClick={toggle} aria-expanded={open} role='button'>
        <div style={{ fontWeight: 700 }}>Mis Libros</div>
        <div>{open ? '▾' : '▸'}</div>
      </Toggle>

      {open && (
        <>
          {/* cuando la tenemos abierta */}
          {loading && <p>Cargando tus libros…</p>}
          {error && <p style={{ color: '#dc2626' }}>{error}</p>}

          {!loading && !error && latest.length === 0 && (
            <p style={{ color: '#666' }}>
              Aquí se mostrarán tus últimas adquisiciones.
            </p>
          )}

          {latest.length > 0 && (
            <Grid>
              {latest.map((b) => {
                // mapeamos los 3 ultimos ejemplares, mostrando fecha compra, img, validDate
                const src = b.cover || b.coverImage || b.coverImageUrl || ''
                const safeDate = b.purchasedAt ? new Date(b.purchasedAt) : null
                const hasValidDate = safeDate && !isNaN(+safeDate)
                return (
                  //  portada para cada libro
                  <Item key={`${b._id}-${b.purchasedAt || b.title}`}>
                    {src ? (
                      <Cover
                        src={src}
                        alt={`Portada de ${b.title}`}
                        onError={(e) =>
                          (e.currentTarget.style.visibility = 'hidden')
                        }
                      />
                    ) : (
                      <CoverBox />
                    )}
                    <div>
                      {/* titulo para cada libro */}
                      <Title>{b.title}</Title>
                      <Meta>
                        {/* autor */}
                        {typeof b.author === 'string'
                          ? b.author
                          : b.author?.name}
                      </Meta>
                      {/* fecha tras validarla */}
                      {hasValidDate && (
                        <Meta>
                          Comprado el{' '}
                          {format(safeDate, "d 'de' MMMM yyyy", { locale: es })}
                        </Meta>
                      )}
                    </div>
                  </Item>
                )
              })}
            </Grid>
          )}

          <div style={{ marginTop: 8, textAlign: 'right' }}>
            <SeeAll to='/my-books'>Ir a mi biblioteca</SeeAll>
          </div>
        </>
      )}
    </Card>
  )
}
