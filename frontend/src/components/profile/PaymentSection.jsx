// frontend/src/components/profile/PaymentSection.jsx
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import useAuth from '../../hooks/useAuth'
import api from '../../api'
import {
  luhnCheck,
  detectBrand,
  isValidExpiry,
  isValidCVC
} from '../../utils/validators'

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
`
const SectionTitle = styled.h2`
  margin: 0 0 12px 0;
  color: ${({ theme }) => theme.colors.primary};
`
const Row = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`
const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
`
const GhostButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
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

/* ===== Helpers ===== */
const digitsOnly = (v) => (v || '').replace(/\D+/g, '')

const formatCardNumber = (raw) => {
  const d = digitsOnly(raw).slice(0, 19)
  return d.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

const formatExpiry = (raw) => {
  const d = digitsOnly(raw).slice(0, 4) // MMYY
  if (!d) return ''
  let mm = d.slice(0, 2)
  let yy = d.slice(2)
  if (mm.length === 2) {
    const n = parseInt(mm, 10)
    if (n === 0) mm = '01'
    else if (n > 12) mm = '12'
  }
  return yy ? `${mm}/${yy}` : mm.length === 2 ? `${mm}/` : mm
}

const maskLast4 = (last4) =>
  last4 ? `•••• •••• •••• ${String(last4).slice(-4)}` : ''

export default function PaymentSection() {
  const { user, setUser } = useAuth()

  // 🔁 Leemos SIEMPRE del objeto anidado user.payment
  // 👇 Fallbacks: primero intentamos anidado, si no, alias planos
  const initialHolder =
    user?.payment?.cardHolderName || user?.cardHolderName || ''

  const initialLast4 =
    user?.payment?.last4 ||
    (user?.cardNumber ? user.cardNumber.replace(/\D+/g, '').slice(-4) : '')

  const initialExpiry = user?.payment?.expiry || user?.payment?.expiry || ''

  const [form, setForm] = useState({
    holderName: initialHolder,
    cardNumber: maskLast4(initialLast4), // mostramos máscara si hay last4
    expiry: initialExpiry,
    cvc: ''
  })
  const [edit, setEdit] = useState(false)
  const [errors, setErrors] = useState({})

  const brand = useMemo(
    () => detectBrand(digitsOnly(form.cardNumber)),
    [form.cardNumber]
  )

  const validate = () => {
    const e = {}

    if (!form.holderName.trim()) e.holderName = 'Titular obligatorio.'

    const numberDigits = digitsOnly(form.cardNumber)
    if (!numberDigits) {
      e.cardNumber = 'Introduce un número de tarjeta.'
    } else if (numberDigits.length < 13 || numberDigits.length > 19) {
      e.cardNumber = 'Debe contener entre 13 y 19 dígitos.'
    } else if (!luhnCheck(numberDigits)) {
      e.cardNumber = 'Tarjeta inválida.'
    }

    if (!isValidExpiry(form.expiry)) e.expiry = 'Caducidad inválida (MM/AA).'

    if (!isValidCVC(digitsOnly(form.cvc), brand)) {
      e.cvc = brand === 'AMEX' ? 'CVC de 4 dígitos.' : 'CVC de 3 dígitos.'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const enterEdit = () => {
    setEdit(true)
    // Si el número está enmascarado, limpiamos para que el user escriba uno real
    if (form.cardNumber.includes('•')) {
      setForm((f) => ({ ...f, cardNumber: '' }))
    }
  }

  const save = async () => {
    if (!validate()) return
    try {
      const payload = {
        holderName: form.holderName.trim(),
        cardNumber: digitsOnly(form.cardNumber), // server solo guarda last4
        expiry: form.expiry,
        cvc: digitsOnly(form.cvc) // no se almacena; solo validación de ejemplo
      }
      const res = await api.put('/api/users/profile', payload)
      // 🔄 Actualizamos el context con lo que el backend SÍ guarda (anidado)
      setUser(res.data.user)

      // Rehidratar form con máscara y valores persistidos
      const p = res.data.user?.payment || {}
      setForm((f) => ({
        holderName: p.cardHolderName || f.holderName,
        cardNumber: maskLast4(p.last4) || '',
        expiry: p.expiry || f.expiry,
        cvc: ''
      }))
      setEdit(false)
      alert('Información de pago actualizada.')
    } catch (err) {
      alert('Error guardando pago')
    }
  }

  return (
    <Card>
      <SectionTitle>Información de pago</SectionTitle>

      <Field>
        <Label htmlFor='cc-name'>Nombre titular</Label>
        <Input
          id='cc-name'
          autoComplete='cc-name'
          value={form.holderName}
          disabled={!edit}
          onChange={(e) =>
            setForm((f) => ({ ...f, holderName: e.target.value }))
          }
        />
        {errors.holderName && <ErrorText>{errors.holderName}</ErrorText>}
      </Field>

      <Field>
        <Label htmlFor='cc-number'>Número de tarjeta</Label>
        <Input
          id='cc-number'
          name='cc-number'
          autoComplete='cc-number'
          placeholder='1234 5678 9012 3456'
          value={form.cardNumber}
          disabled={!edit}
          inputMode='numeric'
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              cardNumber: formatCardNumber(e.target.value)
            }))
          }
          onPaste={(e) => {
            const text = (e.clipboardData || window.clipboardData).getData(
              'text'
            )
            e.preventDefault()
            setForm((f) => ({ ...f, cardNumber: formatCardNumber(text) }))
          }}
        />
        {errors.cardNumber && <ErrorText>{errors.cardNumber}</ErrorText>}
        {!edit && initialLast4 && (
          <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
            Solo almacenamos los últimos 4: {initialLast4}
          </div>
        )}
      </Field>

      <Field>
        <Label htmlFor='cc-exp'>Caducidad (MM/AA)</Label>
        <Input
          id='cc-exp'
          name='cc-exp'
          autoComplete='cc-exp'
          placeholder='MM/AA'
          value={form.expiry}
          disabled={!edit}
          inputMode='numeric'
          onChange={(e) =>
            setForm((f) => ({ ...f, expiry: formatExpiry(e.target.value) }))
          }
        />
        {errors.expiry && <ErrorText>{errors.expiry}</ErrorText>}
      </Field>

      <Field>
        <Label htmlFor='cc-csc'>CVC</Label>
        <Input
          id='cc-csc'
          name='cc-csc'
          autoComplete='cc-csc'
          placeholder={brand === 'AMEX' ? '****' : '***'}
          value={form.cvc}
          disabled={!edit}
          inputMode='numeric'
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              cvc: digitsOnly(e.target.value).slice(0, brand === 'AMEX' ? 4 : 3)
            }))
          }
        />
        {errors.cvc && <ErrorText>{errors.cvc}</ErrorText>}
      </Field>

      <Row>
        {!edit ? (
          <Button type='button' onClick={enterEdit}>
            Editar
          </Button>
        ) : (
          <>
            <Button type='button' onClick={save}>
              Guardar
            </Button>
            <GhostButton
              type='button'
              onClick={() => {
                setForm({
                  holderName: user?.payment?.cardHolderName || '',
                  cardNumber: maskLast4(user?.payment?.last4) || '',
                  expiry: user?.payment?.expiry || '',
                  cvc: ''
                })
                setErrors({})
                setEdit(false)
              }}
            >
              Cancelar
            </GhostButton>
          </>
        )}
      </Row>

      <p style={{ margin: '8px 0 0', color: '#666', fontSize: 12 }}>
        Nota académica: validaciones en cliente (Luhn, CVC, caducidad). En el
        servidor solo guardamos <b>titular</b>, <b>caducidad</b> y{' '}
        <b>últimos 4 dígitos</b>.
      </p>
    </Card>
  )
}
