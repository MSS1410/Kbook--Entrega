import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import { listAllUsersAdmin, toggleUserBlockAdmin } from '../../api/adminApi.js'
import { Search, Grid, List, Eye, Lock, Unlock } from 'lucide-react'
import useScrollToTopOn from '../../../../hooks/useScrollToTopOn.js'
const HeadRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`
const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  input,
  select {
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.cardBg};
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 14px;
  }
`
const ViewToggle = styled.div`
  display: inline-flex;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  overflow: hidden;
  button {
    background: ${({ theme }) => theme.colors.cardBg};
    padding: 8px 10px;
    border: 0;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.text};
  }
  button[data-active='true'] {
    background: ${({ theme }) => theme.colors.mutedSurface};
    color: ${({ theme }) => theme.colors.accent};
    font-weight: 600;
  }
`

/* GRID */
const GridWrap = styled.div`
  display: grid;
  gap: 16px;
  align-items: stretch;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  @media (min-width: 900px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`
const Card = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  overflow: hidden;
`
const Avatar = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #eee;
  flex: 0 0 auto;
  &::before {
    content: '';
    display: block;
    padding-bottom: 100%;
  } /* 1:1 */
  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`
const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  flex: 1;
`
const Name = styled.h3`
  font-size: 15px;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: calc(1.25em * 2);
`
const Badge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 12px;
  background: ${({ theme }) => theme.colors.mutedSurface};
  color: ${({ theme }) => theme.colors.accent};
`
const Actions = styled.div`
  margin-top: auto;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  a,
  button {
    font-size: 13px;
  }
`

/* LIST */
const ListWrap = styled.div`
  display: grid;
  gap: 12px;
`
const Row = styled.div`
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  padding: 8px;
  overflow: hidden;
`
const RowContent = styled.div`
  min-width: 0;
  display: grid;
  gap: 6px;
`
const RowName = styled.div`
  font-weight: 600;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
const RowMeta = styled.div`
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 13px;
`
const RowActions = styled.div`
  display: flex;
  gap: 8px;
  justify-self: end;
  flex-wrap: wrap;
`

const Pager = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  button {
    padding: 8px 12px;
    border-radius: 10px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.cardBg};
  }
  strong {
    min-width: 80px;
    text-align: center;
  }
`

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [view, setView] = useState('grid') // grid | list
  const [order, setOrder] = useState('new') // new | old

  const pageSize = 12
  const [page, setPage] = useState(1)
  useScrollToTopOn(page, q, order)
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const all = await listAllUsersAdmin()
        setUsers(Array.isArray(all) ? all : [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    let arr = [...users]
    if (q.trim()) {
      const s = q.trim().toLowerCase()
      arr = arr.filter((u) => (u.name || '').toLowerCase().includes(s))
    }
    arr.sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime()
      const db = new Date(b.createdAt || 0).getTime()
      return order === 'new' ? db - da : da - db
    })
    return arr
  }, [users, q, order])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages])
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  const onToggleBlock = async (u) => {
    await toggleUserBlockAdmin(u._id, !u.isBlocked)
    const next = users.map((x) =>
      x._id === u._id ? { ...x, isBlocked: !u.isBlocked } : x
    )
    setUsers(next)
  }

  return (
    <>
      <HeadRow>
        <h2 style={{ fontSize: 22 }}>Usuarios</h2>
        <Controls>
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#999'
              }}
            />
            <input
              style={{ paddingLeft: 32 }}
              placeholder='Buscar por nombre'
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <select
            value={order}
            onChange={(e) => {
              setOrder(e.target.value)
              setPage(1)
            }}
          >
            <option value='new'>Registro: más recientes</option>
            <option value='old'>Registro: más antiguos</option>
          </select>

          <ViewToggle>
            <button
              data-active={view === 'grid'}
              onClick={() => setView('grid')}
              title='Vista grid'
            >
              <Grid size={16} />
            </button>
            <button
              data-active={view === 'list'}
              onClick={() => setView('list')}
              title='Vista lista'
            >
              <List size={16} />
            </button>
          </ViewToggle>
        </Controls>
      </HeadRow>

      {loading ? (
        <div style={{ padding: 16 }}>Cargando…</div>
      ) : pageItems.length === 0 ? (
        <div style={{ padding: 16, color: '#64748b' }}>Sin resultados.</div>
      ) : view === 'grid' ? (
        <>
          <GridWrap>
            {pageItems.map((u) => (
              <Card key={u._id}>
                <Avatar>
                  {u.avatar ? <img src={u.avatar} alt={u.name} /> : null}
                </Avatar>
                <CardBody>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <Name title={u.name}>{u.name}</Name>
                    {u.role === 'admin' && <Badge>admin</Badge>}
                    {u.isBlocked && <Badge>bloqueado</Badge>}
                  </div>
                  <Actions>
                    <Button
                      as={Link}
                      $variant='ghost'
                      to={`/admin/users/${u._id}`}
                    >
                      <Eye size={16} /> Ver perfil
                    </Button>
                    <Button
                      $variant={u.isBlocked ? 'primary' : 'danger'}
                      onClick={() => onToggleBlock(u)}
                    >
                      {u.isBlocked ? <Unlock size={16} /> : <Lock size={16} />}
                      {u.isBlocked ? ' Desbloquear' : ' Bloquear'}
                    </Button>
                  </Actions>
                </CardBody>
              </Card>
            ))}
          </GridWrap>

          <Pager>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            <strong>
              Página {page}/{totalPages}
            </strong>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </button>
          </Pager>
        </>
      ) : (
        <>
          <ListWrap>
            {pageItems.map((u) => (
              <Row key={u._id}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 8,
                    overflow: 'hidden',
                    background: '#eee'
                  }}
                >
                  {u.avatar ? (
                    <img
                      src={u.avatar}
                      alt={u.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : null}
                </div>
                <RowContent>
                  <RowName>
                    {u.name}{' '}
                    {u.role === 'admin' && (
                      <span style={{ marginLeft: 8 }}>
                        <Badge>admin</Badge>
                      </span>
                    )}
                    {u.isBlocked && (
                      <span style={{ marginLeft: 8 }}>
                        <Badge>bloqueado</Badge>
                      </span>
                    )}
                  </RowName>
                  <RowMeta>
                    Registrado:{' '}
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString()
                      : '—'}
                  </RowMeta>
                </RowContent>
                <RowActions>
                  <Button
                    as={Link}
                    $variant='ghost'
                    to={`/admin/users/${u._id}`}
                  >
                    <Eye size={16} /> Ver perfil
                  </Button>
                  <Button
                    $variant={u.isBlocked ? 'primary' : 'danger'}
                    onClick={() => onToggleBlock(u)}
                  >
                    {u.isBlocked ? <Unlock size={16} /> : <Lock size={16} />}
                    {u.isBlocked ? ' Desbloquear' : ' Bloquear'}
                  </Button>
                </RowActions>
              </Row>
            ))}
          </ListWrap>

          <Pager>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            <strong>
              Página {page}/{totalPages}
            </strong>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </button>
          </Pager>
        </>
      )}
    </>
  )
}
