import React from 'react'
import styled from 'styled-components'
import Button from '../../Button.jsx'
import { Search, Grid, List, ArrowUpAZ, ArrowDownAZ, Plus } from 'lucide-react'

const Filters = styled.div`
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

export default function AuthorsToolbar({
  q,
  setQ,
  sortAZ,
  setSortAZ,
  view,
  setView,
  onAdd
}) {
  return (
    <Filters>
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
          placeholder='Buscar autores por nombre'
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
          }}
        />
      </div>

      <Button
        $variant='ghost'
        onClick={() => setSortAZ((v) => !v)}
        title={sortAZ ? 'Ordenar Z-A' : 'Ordenar A-Z'}
      >
        {sortAZ ? (
          <>
            <ArrowUpAZ size={16} /> A-Z
          </>
        ) : (
          <>
            <ArrowDownAZ size={16} /> Z-A
          </>
        )}
      </Button>

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

      <Button $variant='primary' onClick={onAdd}>
        <Plus size={16} /> Añadir autor
      </Button>
    </Filters>
  )
}
