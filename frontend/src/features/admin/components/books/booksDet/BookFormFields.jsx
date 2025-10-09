import React from 'react'
import styled from 'styled-components'

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  min-width: 0;
`
const Block = styled(Card)`
  padding: 16px;
  display: grid;
  gap: 10px;
  min-width: 0;
`
const Field = styled.label`
  display: grid;
  gap: 6px;
`
const FieldLabel = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
`

const money = (n) =>
  typeof n === 'number'
    ? n.toLocaleString(undefined, { style: 'currency', currency: 'EUR' })
    : '—'

const priceFrom = (formats, t) => {
  const f = Array.isArray(formats) ? formats.find((x) => x?.type === t) : null
  return typeof f?.price === 'number' ? f.price : null
}

export default function BookFormFields({
  book,
  model,
  setModel,
  editing,
  authors
}) {
  const priceLabel = (b, t) => money(priceFrom(b?.formats, t))
  const authorName =
    typeof book.author === 'object'
      ? book.author?.name || '—'
      : authors.find((a) => String(a._id) === String(book.author))?.name ||
        book.author ||
        '—'

  return (
    <Block>
      <Field>
        <FieldLabel>Título</FieldLabel>
        {editing ? (
          <input
            value={model?.title || ''}
            onChange={(e) => setModel((m) => ({ ...m, title: e.target.value }))}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border,#E2E8F0)',
              borderRadius: 10
            }}
          />
        ) : (
          <div>{book.title || '—'}</div>
        )}
      </Field>

      <Field>
        <FieldLabel>Autor</FieldLabel>
        {editing ? (
          <select
            value={model.author}
            onChange={(e) =>
              setModel((m) => ({ ...m, author: e.target.value }))
            }
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid var(--border,#E2E8F0)',
              borderRadius: 10
            }}
          >
            <option value=''>Selecciona autor…</option>
            {authors.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
        ) : (
          <div>{authorName}</div>
        )}
      </Field>

      <Field>
        <FieldLabel>Categoría</FieldLabel>
        {editing ? (
          <select
            value={model.category}
            onChange={(e) =>
              setModel((m) => ({ ...m, category: e.target.value }))
            }
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid var(--border,#E2E8F0)',
              borderRadius: 10
            }}
          >
            {[
              'Ciencia Ficción',
              'Aventuras',
              'Historia',
              'Psicologia',
              'Infantiles',
              'Ciencia',
              'Natura'
            ].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        ) : (
          <div>{book.category || '—'}</div>
        )}
      </Field>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
          gap: 8
        }}
      >
        <Field>
          <FieldLabel>Precio blanda</FieldLabel>
          {editing ? (
            <input
              type='number'
              step='0.01'
              value={model?.priceSoft ?? 0}
              onChange={(e) =>
                setModel((m) => ({ ...m, priceSoft: Number(e.target.value) }))
              }
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border,#E2E8F0)',
                borderRadius: 10
              }}
            />
          ) : (
            <div>{priceLabel(book, 'TapaBlanda')}</div>
          )}
        </Field>

        <Field>
          <FieldLabel>Precio dura</FieldLabel>
          {editing ? (
            <input
              type='number'
              step='0.01'
              value={model?.priceHard ?? 0}
              onChange={(e) =>
                setModel((m) => ({ ...m, priceHard: Number(e.target.value) }))
              }
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border,#E2E8F0)',
                borderRadius: 10
              }}
            />
          ) : (
            <div>{priceLabel(book, 'TapaDura')}</div>
          )}
        </Field>

        <Field>
          <FieldLabel>Precio eBook</FieldLabel>
          {editing ? (
            <input
              type='number'
              step='0.01'
              value={model?.priceEbook ?? 0}
              onChange={(e) =>
                setModel((m) => ({ ...m, priceEbook: Number(e.target.value) }))
              }
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border,#E2E8F0)',
                borderRadius: 10
              }}
            />
          ) : (
            <div>{priceLabel(book, 'Ebook')}</div>
          )}
        </Field>
      </div>

      <Field>
        <FieldLabel>Sinopsis</FieldLabel>
        {editing ? (
          <textarea
            rows={6}
            value={model?.synopsis ?? ''}
            onChange={(e) =>
              setModel((m) => ({ ...m, synopsis: e.target.value }))
            }
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border,#E2E8F0)',
              borderRadius: 10
            }}
          />
        ) : (
          <div>{book?.synopsis || '—'}</div>
        )}
      </Field>
    </Block>
  )
}
