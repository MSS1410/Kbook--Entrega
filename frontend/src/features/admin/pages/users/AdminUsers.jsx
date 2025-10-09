import React from 'react'
import styled from 'styled-components'
import { Search, Grid, List } from 'lucide-react'
import Button from '../../components/Button.jsx'
import useScrollToTopOn from '../../../../hooks/useScrollToTopOn.js'
import useUsersList from '../../hooks/useUsersList.js'
import UserGridCard from '../../components/users/usersAdmin/UserGridCard.jsx'
import UserListRow from '../../components/users/usersAdmin/UserListRow.jsx'
import { listAllUsersAdmin, toggleUserBlockAdmin } from '../../api/adminApi.js'
import { absUrl } from '../../../../utils/absUrl.js'

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
const GridWrap = styled.div`
  display: grid;
  gap: 16px;
  align-items: stretch;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  @media (min-width: 900px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`
const ListWrap = styled.div`
  display: grid;
  gap: 12px;
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
  const [view, setView] = React.useState('grid') // grid | list
  const {
    loading,
    q,
    setQ,
    order,
    setOrder,
    page,
    setPage,
    totalPages,
    pageItems,
    onToggleBlock
  } = useUsersList(12)

  useScrollToTopOn(page, q, order)

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
              onChange={(e) => setQ(e.target.value)}
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
              <UserGridCard key={u._id} u={u} onToggleBlock={onToggleBlock} />
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
              {' '}
              Página {page}/{totalPages}{' '}
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
              <UserListRow key={u._id} u={u} onToggleBlock={onToggleBlock} />
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
              {' '}
              Página {page}/{totalPages}{' '}
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
