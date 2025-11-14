import React from 'react'
import styled from 'styled-components'
import {
  blockNonNumericKeys,
  formatExpiry,
  formatCVC
} from '../../../../../../utils/validators'

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

export default function PaymentForm({
  hasProfilePayment,  // true si perfil tiene holder/last4/expiry
  useAltPayment, // true si user  nuevos datos
  onToggleAlt, // setter
  brand, // marca detectada
  values,
  errors,
  editable,
  formatCardNumber, // helper (espacia cada 4)

  onChange,
  setErrors,
  onBack,
  onNext
}) {
  return (
    <FormSection>
      <h2>2. Información de pago</h2>

      {hasProfilePayment && (   /* mismo funcionamiento que envio */
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
            checked={useAltPayment}
            onChange={(e) => onToggleAlt(e.target.checked)}
          />
          Usar otros datos de pago
        </label>
      )}

      {/* Titular */}
      <Field>
        <Label>Nombre del titular</Label>
        <Input
          value={values.holderName || ''}         /* perfil o nuevo */
          onChange={(e) => editable && onChange('holderName', e.target.value)}
          hasError={!!errors.holderName}
          disabled={!editable}             /* bloqueado si  perfil */
          autoComplete='cc-name'    // hint nav
        />
        {errors.holderName && <ErrorText>{errors.holderName}</ErrorText>}
      </Field>

      {/* numero */}
      <Field>
        <Label>Número de tarjeta {brand ? `(${brand})` : ''}</Label>
        <Input
          value={values.cardNumber || ''}    /* mask en perfil // nuevo*/
          onChange={(e) => {
            if (!editable) return
            onChange('cardNumber', formatCardNumber(e.target.value))
          }}
          hasError={!!errors.cardNumber}
          disabled={!editable}
          placeholder={editable ? '1234 5678 9012 3456' : ''}   /*  hint si editable */
          inputMode='numeric'               // teclado num en mobiles
          autoComplete='cc-number'           
          onKeyDown={blockNonNumericKeys}          // bloqueo letras y simb
          onPaste={(e) => {            // limpipa y format
            if (!editable) return
            const text = (e.clipboardData || window.clipboardData).getData(
              'text'
            )
            e.preventDefault()
            onChange('cardNumber', formatCardNumber(text))
          }}
          maxLength={editable ? 23 : undefined}    // 19 digits, 4 spaces, = 23
        />
        {errors.cardNumber && <ErrorText>{errors.cardNumber}</ErrorText>}
      </Field>

      {/* caducidad trjt */}
      <Field>
        <Label>Fecha de caducidad (MM/AA)</Label>
        <Input
          value={values.expiry || ''}
          onChange={(e) => {
            if (!editable) return
            onChange('expiry', formatExpiry(e.target.value))   // auto y normalizo a mm
          }}
          hasError={!!errors.expiry}
          disabled={!editable}
          placeholder={editable ? 'MM/AA' : ''}
          inputMode='numeric'
          autoComplete='cc-exp'
          onKeyDown={blockNonNumericKeys}
          onPaste={(e) => {      // aseguramos formato al pegar
            if (!editable) return
            const text = (e.clipboardData || window.clipboardData).getData(
              'text'
            )
            e.preventDefault()
            onChange('expiry', formatExpiry(text))
          }}
          maxLength={5}    // 4 digits y /
          onBlur={() => {
            if (!editable) return
            setErrors((prev) => ({ ...prev, expiry: undefined }))
          }}
        />
        {errors.expiry && <ErrorText>{errors.expiry}</ErrorText>}
      </Field>

      {/* CVC */}
      <Field>
        <Label>CVC</Label>
        <Input
          value={values.cvc || ''}
          onChange={(e) => {
            if (!editable) return
            onChange('cvc', formatCVC(e.target.value, brand))  // 3 digits o 4 si AMEX
          }}
          hasError={!!errors.cvc}
          disabled={!editable}
          placeholder={editable ? (brand === 'AMEX' ? '****' : '***') : ''} // hint por marca
          inputMode='numeric'
          autoComplete='cc-csc'
          onKeyDown={blockNonNumericKeys}
          onPaste={(e) => {
            if (!editable) return
            const text = (e.clipboardData || window.clipboardData).getData(
              'text'
            )
            e.preventDefault()
            onChange('cvc', formatCVC(text, brand))
          }}
          maxLength={brand === 'AMEX' ? 4 : 3}    
          onBlur={() => {
            if (!editable) return
            setErrors((prev) => ({ ...prev, cvc: undefined }))
          }}
        />
        {errors.cvc && <ErrorText>{errors.cvc}</ErrorText>}
      </Field>

      <ButtonRow>
        <SecondaryButton onClick={onBack}>Atrás</SecondaryButton>  
        
        <PrimaryButton onClick={onNext}>Siguiente</PrimaryButton>
      </ButtonRow>
    </FormSection>
  )
}
