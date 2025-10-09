// components/PaymentSection.jsx
import React from 'react'
import styled from 'styled-components'
import {
  formatExpiry,
  blockNonNumericKeys
} from '../../../../../../utils/validators'
import { detectBrand } from '../../../../../../utils/validators'

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
const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
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

const digitsOnly = (v) => (v || '').replace(/\D+/g, '')

export default function PaymentSection({
  useAltPayment,
  onToggle,
  brand,
  form,
  errors,
  onChange,
  setErrors,
  formatCardNumber,
  maskLast4,
  user
}) {
  return (
    <Card>
      <H2>Información de pago</H2>
      <Row>
        <input
          id='other-pay'
          type='checkbox'
          checked={useAltPayment}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <label htmlFor='other-pay'>Usar otros datos de pago</label>
      </Row>

      {!useAltPayment ? (
        <>
          <SummaryRow>
            <div>Titular:</div>
            <div>{user?.payment?.cardHolderName || user?.name || '—'}</div>
          </SummaryRow>
          <SummaryRow>
            <div>Tarjeta:</div>
            <div>{maskLast4(user?.payment?.last4)}</div>
          </SummaryRow>
          <SummaryRow>
            <div>Caducidad:</div>
            <div>{user?.payment?.expiry || '—'}</div>
          </SummaryRow>
          <SmallNote>
            Origen: tu perfil. Marca “Usar otros datos de pago” para introducir
            otra tarjeta.
          </SmallNote>
        </>
      ) : (
        <>
          <Field>
            <Label>Nombre titular</Label>
            <Input
              value={form.holderName}
              onChange={(e) => onChange('holderName', e.target.value)}
            />
            {errors.holderName && <ErrorText>{errors.holderName}</ErrorText>}
          </Field>
          <Field>
            <Label>Número de tarjeta {brand ? `(${brand})` : ''}</Label>
            <Input
              placeholder='1234 5678 9012 3456'
              value={form.cardNumber}
              inputMode='numeric'
              onChange={(e) =>
                onChange('cardNumber', formatCardNumber(e.target.value))
              }
              onPaste={(e) => {
                const text = (e.clipboardData || window.clipboardData).getData(
                  'text'
                )
                e.preventDefault()
                onChange('cardNumber', formatCardNumber(text))
              }}
              onKeyDown={blockNonNumericKeys}
            />
            {errors.cardNumber && <ErrorText>{errors.cardNumber}</ErrorText>}
          </Field>
          <Field>
            <Label>Caducidad (MM/AA)</Label>
            <Input
              placeholder='MM/AA'
              value={form.expiry}
              inputMode='numeric'
              onChange={(e) => onChange('expiry', formatExpiry(e.target.value))}
              onKeyDown={blockNonNumericKeys}
              maxLength={5}
              onBlur={() =>
                setErrors((prev) => ({ ...prev, expiry: undefined }))
              }
            />
            {errors.expiry && <ErrorText>{errors.expiry}</ErrorText>}
          </Field>
          <Field>
            <Label>CVC</Label>
            <Input
              placeholder={
                detectBrand(digitsOnly(form.cardNumber)) === 'AMEX'
                  ? '****'
                  : '***'
              }
              value={form.cvc}
              inputMode='numeric'
              onChange={(e) => {
                const max =
                  detectBrand(digitsOnly(form.cardNumber)) === 'AMEX' ? 4 : 3
                onChange('cvc', digitsOnly(e.target.value).slice(0, max))
              }}
              onKeyDown={blockNonNumericKeys}
            />
            {errors.cvc && <ErrorText>{errors.cvc}</ErrorText>}
          </Field>
          <SmallNote>Estos datos no se guardan en tu perfil.</SmallNote>
        </>
      )}
    </Card>
  )
}
