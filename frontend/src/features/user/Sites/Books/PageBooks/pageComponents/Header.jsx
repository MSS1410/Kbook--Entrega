import React from 'react'
import styled from 'styled-components'
import { FiGrid, FiList } from 'react-icons/fi'

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`
const H1 = styled.h1`
  margin: 0;
  font-size: 1.4rem;
`
const Tools = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`
const ToggleGroup = styled.div`
  display: inline-flex;
  border: 1px solid #e6e6e8;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
`
const ToggleBtn = styled.button`
  padding: 6px 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  border: none;
  background: ${({ active }) => (active ? '#f2f2f6' : 'transparent')};
  color: ${({ active }) => (active ? '#111' : '#555')};
  cursor: pointer;

  &:not(:last-child) {
    border-right: 1px solid #e6e6e8;
  }
`

// barra superior de bookspage, titulo toggle vista

export default function Header({ title, view, onSetView }) {
  return (
    // permite cambio de vista
    <HeaderRow>
      <H1>{title}</H1>
      <Tools>
        <ToggleGroup role='tablist' aria-label='Cambiar vista'>
          <ToggleBtn
            type='button'
            active={view === 'list'}
            aria-pressed={view === 'list'}
            onClick={() => onSetView('list')}
            title='Vista lista'
          >
            {/* accesible aria-label, para el grupo, aria-pressed */}
            <FiList /> Lista
          </ToggleBtn>
          <ToggleBtn
            type='button'
            active={view === 'grid'}
            aria-pressed={view === 'grid'}
            onClick={() => onSetView('grid')}
            title='Vista rejilla'
          >
            <FiGrid /> Rejilla
          </ToggleBtn>
        </ToggleGroup>
      </Tools>
    </HeaderRow>
  )
}
