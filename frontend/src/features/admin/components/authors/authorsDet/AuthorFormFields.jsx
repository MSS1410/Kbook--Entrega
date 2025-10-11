import React from 'react'
import styled from 'styled-components'

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  overflow: hidden;
`
const Block = styled(Card)`
  padding: 16px;
  display: grid;
  gap: 10px;
`
const Field = styled.label`
  display: grid;
  gap: 6px;
`
const FieldLabel = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
`

export default function AuthorFormFields({ author, model, setModel, editing }) {
  return (
    <Block>
      <Field>
        <FieldLabel>Nombre</FieldLabel>
        {editing ? (
          <input
            value={model.name}
            onChange={(e) => setModel((m) => ({ ...m, name: e.target.value }))}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border,#E2E8F0)',
              borderRadius: 10
            }}
          />
        ) : (
          // modo lectura

          <div>{author.name || '—'}</div>
        )}
      </Field>

      <Field>
        <FieldLabel>Biografía</FieldLabel>
        {editing ? (
          <textarea
            rows={6}
            value={model.biography}
            onChange={(e) =>
              setModel((m) => ({ ...m, biography: e.target.value }))
            }
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border,#E2E8F0)',
              borderRadius: 10
            }}
          />
        ) : (
          // modo lectura
          <div>{author.biography || '—'}</div>
        )}
      </Field>
    </Block>
  )
}
