// components/ShippingSection.jsx
import React from 'react'
import styled from 'styled-components'

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
`
const H2 = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`
const Field = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`
const Label = styled.label`
  display: block;
  margin-bottom: 4px;
  font-weight: 700;
`
const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
`
const ErrorText = styled.div`
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
`
const SmallNote = styled.p`
  color: #666;
  font-size: 12px;
  margin: 6px 0 0;
`

export default function ShippingSection({
  useAltShipping,
  onToggle,
  form,
  errors,
  onChange
}) {
  return (
    <Card>
      <H2>Información de envío</H2>
      <Row>
        <input
          id='other-address'
          type='checkbox'
          checked={useAltShipping}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <label htmlFor='other-address'>Usar otra dirección</label>
      </Row>

      {!useAltShipping ? (
        <>
          <div style={{ display: 'grid', gap: 6 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12
              }}
            >
              <div>Nombre:</div>
              <div>{form.fullName || '—'}</div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12
              }}
            >
              <div>Dirección:</div>
              <div>
                {form.address}
                {form.address && ', '} {form.city}
                {form.city && ', '}
                {form.postalCode}
                {form.postalCode && ', '} {form.country}
              </div>
            </div>
          </div>
          <SmallNote>
            Origen: tu perfil/orden. Marca “Usar otra dirección” para cambiarla
            sólo aquí.
          </SmallNote>
        </>
      ) : (
        <>
          {[
            ['fullName', 'Nombre completo'],
            ['address', 'Dirección'],
            ['city', 'Ciudad'],
            ['postalCode', 'Código postal'],
            ['country', 'País']
          ].map(([key, label]) => (
            <Field key={key}>
              <Label>{label}</Label>
              <Input
                value={form[key] || ''}
                onChange={(e) => onChange(key, e.target.value)}
              />
              {errors[key] && <ErrorText>{errors[key]}</ErrorText>}
            </Field>
          ))}
          <SmallNote>
            Estos cambios no actualizan tu perfil ni la orden almacenada.
          </SmallNote>
        </>
      )}
    </Card>
  )
}
