// frontend/src/features/pages/CheckOutPage.jsx
import React, { useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import useCart from '../../hooks/useCart'
import useAuth from '../../hooks/useAuth'
import { createOrder, payOrder } from '../../api/orders'

const Container = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`
const StepsBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`
const Step = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ active, completed, theme }) =>
    completed ? '#d4edda' : active ? theme.colors.surfaceVariant : '#f0f0f0'};
  display: flex;
  flex-direction: column;
  align-items: center;
  font-weight: bold;
  span {
    margin-top: 4px;
    font-size: 0.85rem;
  }
`
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
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`
const SecondaryButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.onSurfaceVariant};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
`
const SummaryBox = styled.div`
  background: #f9f9f9;
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};
`
const ShippingSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid #ccc;
  width: 100%;
`

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, removeItem } = useCart()
  const { user } = useAuth()

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const [shipping, setShipping] = useState({
    name: user?.name || '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  })
  const [shippingErrors, setShippingErrors] = useState({})
  const [payment, setPayment] = useState({
    cardNumber: '',
    cvc: '',
    expiry: '',
    holderName: ''
  })
  const [paymentErrors, setPaymentErrors] = useState({})

  const shippingOptions = [
    {
      key: 'standard',
      label: 'Entrega estándar (5-6 días laborables)',
      extra: 0,
      description: 'Entrega en 5-6 días laborables'
    },
    {
      key: 'fast',
      label: 'Entrega rápida (+4.99€) (2 días laborables)',
      extra: 4.99,
      description: 'Entrega en 2 días laborables'
    }
  ]
  const [selectedShippingOption, setSelectedShippingOption] = useState(
    shippingOptions[0]
  )

  const validateShipping = () => {
    const e = {}
    if (!shipping.name.trim()) e.name = 'Este campo es obligatorio'
    if (!shipping.address.trim()) e.address = 'Este campo es obligatorio'
    if (!shipping.city.trim()) e.city = 'Este campo es obligatorio'
    if (!shipping.postalCode.trim()) e.postalCode = 'Este campo es obligatorio'
    if (!shipping.country.trim()) e.country = 'Este campo es obligatorio'
    setShippingErrors(e)
    return Object.keys(e).length === 0
  }
  const validatePayment = () => {
    const e = {}
    if (!payment.cardNumber.trim()) e.cardNumber = 'Este campo es obligatorio'
    if (!payment.cvc.trim()) e.cvc = 'Este campo es obligatorio'
    if (!payment.expiry.trim()) e.expiry = 'Este campo es obligatorio'
    if (!payment.holderName.trim()) e.holderName = 'Este campo es obligatorio'
    setPaymentErrors(e)
    return Object.keys(e).length === 0
  }

  const subtotal = cart.items.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  )
  const shippingCost = selectedShippingOption.extra
  const total = subtotal + shippingCost

  const handleNext = () => {
    if (step === 1) {
      if (!validateShipping()) return
      setStep(2)
    } else if (step === 2) {
      if (!validatePayment()) return
      setStep(3)
    }
  }
  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1)
  }

  const handleConfirm = async () => {
    setSubmitError(null)
    setSubmitting(true)
    try {
      // 1) crear orden en backend
      const shippingAddress = {
        fullName: shipping.name,
        address: shipping.address,
        city: shipping.city,
        postalCode: shipping.postalCode,
        country: shipping.country
      }
      const paymentMethod = 'card'
      const { data: order } = await createOrder({
        shippingAddress,
        paymentMethod
        // (opcional futuro) shippingOption si decides persistirlo en BD
      })

      // 2) confirmar pago → pasa a paid
      const { data: paidOrder } = await payOrder(order._id)

      // 3) guardar shippingOption como respaldo para OrderConfirm
      try {
        sessionStorage.setItem(
          'kbook:lastShippingOption',
          JSON.stringify(selectedShippingOption)
        )
      } catch (_) {}

      // 4) limpiar carrito en cliente
      try {
        if (typeof cart.clear === 'function') cart.clear()
        else
          for (const it of [...cart.items]) removeItem(it.book._id, it.format)
      } catch (_) {}

      // 5) navegar a confirmación con datos
      navigate('/order-confirm', {
        state: { order: paidOrder, shippingOption: selectedShippingOption }
      })
    } catch (e) {
      console.error('Error al finalizar compra', e)
      setSubmitError(
        e?.response?.data?.message || 'No pudimos procesar tu compra.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container>
      <h1>Compra</h1>
      <StepsBar>
        <Step active={step === 1} completed={step > 1}>
          1<span>Datos de envío</span>
        </Step>
        <Step active={step === 2} completed={step > 2}>
          2<span>Pago</span>
        </Step>
        <Step active={step === 3} completed={step === 3}>
          3<span>Revisión</span>
        </Step>
      </StepsBar>

      {step === 1 && (
        <FormSection>
          <h2>1. Información de envío</h2>
          <Field>
            <Label>Nombre completo</Label>
            <Input
              value={shipping.name}
              onChange={(e) =>
                setShipping((s) => ({ ...s, name: e.target.value }))
              }
              hasError={!!shippingErrors.name}
            />
            {shippingErrors.name && (
              <ErrorText>{shippingErrors.name}</ErrorText>
            )}
          </Field>
          <Field>
            <Label>Dirección</Label>
            <Input
              value={shipping.address}
              onChange={(e) =>
                setShipping((s) => ({ ...s, address: e.target.value }))
              }
              hasError={!!shippingErrors.address}
            />
            {shippingErrors.address && (
              <ErrorText>{shippingErrors.address}</ErrorText>
            )}
          </Field>
          <Field>
            <Label>Ciudad</Label>
            <Input
              value={shipping.city}
              onChange={(e) =>
                setShipping((s) => ({ ...s, city: e.target.value }))
              }
              hasError={!!shippingErrors.city}
            />
            {shippingErrors.city && (
              <ErrorText>{shippingErrors.city}</ErrorText>
            )}
          </Field>
          <Field>
            <Label>Código postal</Label>
            <Input
              value={shipping.postalCode}
              onChange={(e) =>
                setShipping((s) => ({ ...s, postalCode: e.target.value }))
              }
              hasError={!!shippingErrors.postalCode}
            />
            {shippingErrors.postalCode && (
              <ErrorText>{shippingErrors.postalCode}</ErrorText>
            )}
          </Field>
          <Field>
            <Label>País</Label>
            <Input
              value={shipping.country}
              onChange={(e) =>
                setShipping((s) => ({ ...s, country: e.target.value }))
              }
              hasError={!!shippingErrors.country}
            />
            {shippingErrors.country && (
              <ErrorText>{shippingErrors.country}</ErrorText>
            )}
          </Field>

          <ButtonRow>
            <SecondaryButton onClick={handleBack} disabled={step === 1}>
              Atrás
            </SecondaryButton>
            <PrimaryButton onClick={handleNext}>Siguiente</PrimaryButton>
          </ButtonRow>
        </FormSection>
      )}

      {step === 2 && (
        <FormSection>
          <h2>2. Información de pago</h2>
          <Field>
            <Label>Nombre del titular</Label>
            <Input
              value={payment.holderName}
              onChange={(e) =>
                setPayment((p) => ({ ...p, holderName: e.target.value }))
              }
              hasError={!!paymentErrors.holderName}
            />
            {paymentErrors.holderName && (
              <ErrorText>{paymentErrors.holderName}</ErrorText>
            )}
          </Field>
          <Field>
            <Label>Número de tarjeta</Label>
            <Input
              value={payment.cardNumber}
              onChange={(e) =>
                setPayment((p) => ({ ...p, cardNumber: e.target.value }))
              }
              hasError={!!paymentErrors.cardNumber}
            />
            {paymentErrors.cardNumber && (
              <ErrorText>{paymentErrors.cardNumber}</ErrorText>
            )}
          </Field>
          <Field>
            <Label>Fecha de caducidad (MM/AA)</Label>
            <Input
              value={payment.expiry}
              onChange={(e) =>
                setPayment((p) => ({ ...p, expiry: e.target.value }))
              }
              hasError={!!paymentErrors.expiry}
            />
            {paymentErrors.expiry && (
              <ErrorText>{paymentErrors.expiry}</ErrorText>
            )}
          </Field>
          <Field>
            <Label>CVC</Label>
            <Input
              value={payment.cvc}
              onChange={(e) =>
                setPayment((p) => ({ ...p, cvc: e.target.value }))
              }
              hasError={!!paymentErrors.cvc}
            />
            {paymentErrors.cvc && <ErrorText>{paymentErrors.cvc}</ErrorText>}
          </Field>

          <ButtonRow>
            <SecondaryButton onClick={handleBack}>Atrás</SecondaryButton>
            <PrimaryButton onClick={handleNext}>Siguiente</PrimaryButton>
          </ButtonRow>
        </FormSection>
      )}

      {step === 3 && (
        <FormSection>
          <h2>3. Revisión y envío</h2>

          <SummaryBox>
            <h3>Datos de envío</h3>
            <div>{shipping.name}</div>
            <div>{shipping.address}</div>
            <div>
              {shipping.city}, {shipping.postalCode}, {shipping.country}
            </div>
          </SummaryBox>

          <SummaryBox>
            <h3>Pago</h3>
            <div>Titular: {payment.holderName}</div>
            <div>
              Tarjeta terminada en: **** **** ****{' '}
              {payment.cardNumber.slice(-4)}
            </div>
          </SummaryBox>

          <SummaryBox>
            <h3>Entrega</h3>
            <Label>Opción de envío</Label>
            <ShippingSelect
              value={selectedShippingOption.key}
              onChange={(e) => {
                const opt = ['standard', 'fast'].includes(e.target.value)
                  ? shippingOptions.find((o) => o.key === e.target.value)
                  : shippingOptions[0]
                setSelectedShippingOption(opt || shippingOptions[0])
              }}
            >
              {shippingOptions.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </ShippingSelect>
            <div style={{ marginTop: 8 }}>
              {selectedShippingOption.description}
            </div>
          </SummaryBox>

          <SummaryBox>
            <h3>Resumen del pedido</h3>
            {cart.items.map((it) => (
              <div
                key={`${it.book._id}-${it.format}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 4
                }}
              >
                <div>
                  {it.quantity} x {it.book.title} ({it.label})
                </div>
                <div>{(it.price * it.quantity).toFixed(2)} €</div>
              </div>
            ))}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 8
              }}
            >
              <div>Subtotal</div>
              <div>{subtotal.toFixed(2)} €</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>Envío</div>
              <div>{shippingCost.toFixed(2)} €</div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 'bold',
                marginTop: 4
              }}
            >
              <div>Total</div>
              <div>{total.toFixed(2)} €</div>
            </div>
          </SummaryBox>

          {submitError && (
            <div style={{ color: 'red', marginTop: 8 }}>{submitError}</div>
          )}

          <ButtonRow>
            <SecondaryButton onClick={handleBack} disabled={submitting}>
              Atrás
            </SecondaryButton>
            <PrimaryButton onClick={handleConfirm} disabled={submitting}>
              {submitting ? 'Procesando…' : 'Finalizar compra'}
            </PrimaryButton>
          </ButtonRow>
        </FormSection>
      )}
    </Container>
  )
}
