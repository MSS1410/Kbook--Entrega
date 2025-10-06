import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Modal from './Modal'
import { searchUsers } from '../../api/messages'

import { AVATAR_PLACEHOLDER } from '../../constants/media'

const ModalTitle = styled.h3`
  margin: 0 0 6px;
`
const Help = styled.p`
  margin: 0 0 10px;
  color: #666;
  font-size: 0.95rem;
`
const SearchBox = styled.div`
  display: flex;
  gap: 8px;
`
const Input = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
`
const Results = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 10px;
  max-height: 320px;
  overflow: auto;
`
const ResultRow = styled.button`
  display: grid;
  grid-template-columns: 36px 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 8px;
  border: 1px solid ${({ $active }) => ($active ? '#8b5cf6' : '#eee')};
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  text-align: left;
  &:hover {
    background: #fafaff;
  }
`
const SmallAvatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  object-fit: cover;
  background: #f1f1f6;
`
const Info = styled.div`
  display: flex;
  flex-direction: column;
`
const Email = styled.span`
  color: #666;
  font-size: 12px;
`
const StartRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  gap: 8px;
`
const CancelBtn = styled.button`
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: #fff;
  color: #333;
  cursor: pointer;
`
const StartBtn = styled.button`
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors?.primary || '#8b5cf6'};
  background: ${({ disabled, theme }) =>
    disabled ? '#eee' : theme.colors?.primary || '#8b5cf6'};
  color: ${({ disabled }) => (disabled ? '#999' : '#fff')};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
`

export default function NewChatModal({ open, onClose, onConfirm }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const debounceRef = useRef(null)

  // Resetear estado al abrir/cerrar
  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
      setSelectedUser(null)
      setLoadingSearch(false)
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [open])

  // Búsqueda con sugerencias (debounce 250ms)
  useEffect(() => {
    if (!open) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setSelectedUser(null)
      return
    }
    setLoadingSearch(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await searchUsers(q)
        setResults(Array.isArray(data?.users) ? data.users : [])
      } catch {
        setResults([])
      } finally {
        setLoadingSearch(false)
      }
    }, 250)
    return () => debounceRef.current && clearTimeout(debounceRef.current)
  }, [open, query])

  const handleConfirm = () => {
    if (!selectedUser) return
    onConfirm?.(selectedUser)
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalTitle>Nuevo chat</ModalTitle>
      <Help>
        Busca un usuario registrado y selecciónalo para habilitar “Iniciar
        chat”.
      </Help>
      <SearchBox>
        <Input
          autoFocus
          placeholder='Nombre o email…'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </SearchBox>

      <Results>
        {loadingSearch && <div style={{ color: '#666' }}>Buscando…</div>}
        {!loadingSearch && results.length === 0 && query.trim().length >= 2 && (
          <div style={{ color: '#666' }}>
            Sin resultados para “{query.trim()}”.
          </div>
        )}
        {results.map((u) => {
          const active = selectedUser?._id === u._id
          return (
            <ResultRow
              type='button'
              key={u._id}
              $active={active}
              onClick={() => setSelectedUser(u)}
              title={active ? 'Seleccionado' : 'Seleccionar'}
            >
              <SmallAvatar
                src={u.avatar || AVATAR_PLACEHOLDER}
                alt={u.name}
                onError={(e) => {
                  if (e.currentTarget.src !== AVATAR_PLACEHOLDER) {
                    e.currentTarget.src = AVATAR_PLACEHOLDER
                  }
                }}
              />
              <Info>
                <strong>{u.name}</strong>
                <Email>{u.email}</Email>
              </Info>
              <span
                style={{ color: active ? '#8b5cf6' : '#999', fontWeight: 700 }}
              >
                {active ? '✓' : 'Elegir'}
              </span>
            </ResultRow>
          )
        })}
      </Results>

      <StartRow>
        <CancelBtn type='button' onClick={onClose}>
          Cancelar
        </CancelBtn>
        <StartBtn disabled={!selectedUser} onClick={handleConfirm}>
          Iniciar chat
        </StartBtn>
      </StartRow>
    </Modal>
  )
}
