import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { ChevronDown } from 'lucide-react'

const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: start;
`
const ComboWrap = styled.div`
  position: relative;
`
const ComboInput = styled.input`
  width: 100%;
  padding: 10px 36px 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
`
const ComboSuffix = styled.div`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #8a8a8a;
  display: grid;
  place-items: center;
`
const ComboList = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  max-height: 240px;
  overflow: auto;
  z-index: 20;
`
const ComboItem = styled.button`
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  padding: 10px 12px;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.mutedSurface};
  }
`

export default function AuthorCombo({ authors, value, onChange, extraButton }) {
  const [query, setQuery] = useState('') // texto del input
  const [open, setOpen] = useState(false) // dropdown open closed
  const ref = useRef(null) // outclick para cerrar

  const selectedName = useMemo(
    () => authors.find((a) => String(a._id) === String(value))?.name || '',
    [authors, value]
  )
  // nombre del autor selected por id

  useEffect(() => setQuery(selectedName), [selectedName]) // cuando cambia el value, refleja el nombre

  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    // UX cierra cick fuera
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const list = useMemo(() => {
    const s = query.trim().toLowerCase()

    if (!s) return authors.slice(0, 20)
    // primeras 20 lineas si no hay query
    return authors
      .filter((a) => (a.name || '').toLowerCase().includes(s))
      .slice(0, 20)
  }, [authors, query])

  return (
    <>
      <div style={{ color: '#8a2be2', fontWeight: 700, marginBottom: 6 }}>
        Autor *
      </div>
      <FieldRow>
        <ComboWrap ref={ref}>
          <ComboInput
            placeholder='Busca por nombre…'
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
          />
          <ComboSuffix>
            <ChevronDown size={16} />
          </ComboSuffix>
          {open && (
            <ComboList>
              {list.length === 0 && (
                <div style={{ padding: 10, color: '#64748b' }}>
                  Sin resultados
                </div>
              )}
              {list.map((a) => (
                <ComboItem
                  key={a._id}
                  onClick={() => {
                    onChange(a._id)
                    setQuery(a.name)
                    setOpen(false)
                  }}
                >
                  {a.name}
                </ComboItem>
              ))}
            </ComboList>
          )}
        </ComboWrap>
        {extraButton}
      </FieldRow>
      <div style={{ fontSize: 12, marginTop: 6, color: '#b45309' }}>
        Debe elegir un autor que ya esté guardado en la base de datos.
      </div>
    </>
  )
}
