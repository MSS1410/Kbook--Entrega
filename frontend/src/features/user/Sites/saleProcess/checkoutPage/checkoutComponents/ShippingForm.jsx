// components/ShippingForm.jsx
import React from 'react'
import styled from 'styled-components'

const FormSection = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
`
const Field = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`
const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: 4px;
`
const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ hasError }) => (hasError ? 'red' : '#ccc')};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.base};
`
const ErrorText = styled.div`
  color: red;
  font-size: 0.75rem;
  margin-top: 2px;
`
const ButtonRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`
const PrimaryButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border: none;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
`
const SecondaryButton = styled.button`
  background: none;
  border: 1px solid
    ${({ theme }) => theme.colors.onSurfaceVariant || theme.colors.border};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
`

export default function ShippingForm({
  hasProfileShipping,
  useAltShipping,
  onToggleAlt,
  values,
  errors,
  editable,
  onChange,
  onBack,
  onNext
}) {
  return (
    <FormSection>
      <h2>1. Información de envío</h2>

      {hasProfileShipping && (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12
          }}
        >
          <input
            type='checkbox'
            checked={useAltShipping}
            onChange={(e) => onToggleAlt(e.target.checked)}
          />
          Usar otra dirección
        </label>
      )}

      {[
        ['name', 'Nombre completo'],
        ['address', 'Dirección'],
        ['city', 'Ciudad'],
        ['postalCode', 'Código postal'],
        ['country', 'País']
      ].map(([key, label]) => (
        <Field key={key}>
          <Label>{label}</Label>
          <Input
            value={values[key] || ''}
            onChange={(e) => editable && onChange(key, e.target.value)}
            hasError={!!errors[key]}
            disabled={!editable}
          />
          {errors[key] && <ErrorText>{errors[key]}</ErrorText>}
        </Field>
      ))}

      <ButtonRow>
        <SecondaryButton onClick={onBack} disabled>
          {' '}
          Atrás{' '}
        </SecondaryButton>
        <PrimaryButton onClick={onNext}> Siguiente </PrimaryButton>
      </ButtonRow>
    </FormSection>
  )
}
