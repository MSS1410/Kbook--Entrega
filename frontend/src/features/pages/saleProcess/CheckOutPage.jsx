import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import useCart from '../../../hooks/useCart'
import useAuth from '../../../hooks/useAuth'
import { createOrder, payOrder } from '../../../api/orders'
import api from '../../../api/index'
import {
  luhnCheck,
  detectBrand,
  isValidExpiry,
  isValidCVC,
  blockNonNumericKeys,
  formatExpiry,
  formatCVC
} from '../../../utils/validators'
import { addBusinessDays, format } from 'date-fns'

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
    completed ? '#d4edda' : active ? theme.colors.mutedSurface : '#f0f0f0'};
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
  border: 1px solid
    ${({ theme }) => theme.colors.onSurfaceVariant || theme.colors.border};
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

/* ==== Nuevos estilos para el Paso 3 (B4) ==== */
const TopSummary = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`
const SummaryCard = styled.div`
  background: ${({ theme }) => theme.colors.mutedSurface};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.md};
`
const LV = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 8px;
  row-gap: 4px;
  font-size: 0.95rem;
  & + & {
    margin-top: 6px;
  }
  b {
    font-weight: 700;
  }
`
const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 240px));
  gap: ${({ theme }) => theme.spacing.lg};
  justify-content: start;
`
const ItemCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`
const Cover = styled.div`
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.mutedSurface};
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`
const ItemTitle = styled.div`
  font-weight: 600;
  line-height: 1.3;
`
const PriceRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: baseline;
`
const Note = styled.p`
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 0.9rem;
  margin-top: 6px;
`

// helpers locales
const digitsOnly = (v) => (v || '').replace(/\D+/g, '')
const formatCardNumber = (raw) =>
  digitsOnly(raw)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim()

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, removeItem } = useCart()
  const { user, setUser } = useAuth()

  // Traemos perfil si el contexto no lo tiene cargado (o viene sin shipping/payment)
  useEffect(() => {
    const needs =
      !user ||
      typeof user.address === 'undefined' ||
      (user?.payment == null && user?.cardNumber == null)
    if (needs) {
      ;(async () => {
        try {
          const { data } = await api.get('/api/users/profile')
          if (data?.user) setUser(data.user)
        } catch (_) {}
      })()
    }
  }, [user, setUser])

  // Prefills desde perfil (admite forma “plana” y anidada)
  const profileShipping = {
    name: user?.name || '',
    address: user?.address || user?.shipping?.address || '',
    city: user?.city || user?.shipping?.city || '',
    postalCode: user?.postalCode || user?.shipping?.postalCode || '',
    country: user?.country || user?.shipping?.country || ''
  }
  const profilePayment = {
    holderName:
      user?.payment?.cardHolderName || user?.holderName || user?.name || '',
    last4:
      user?.payment?.last4 ||
      (user?.cardNumber ? user.cardNumber.replace(/\D+/g, '').slice(-4) : ''),
    expiry: user?.payment?.expiry || user?.expiry || ''
  }
  const hasProfileShipping =
    !!profileShipping.address &&
    !!profileShipping.city &&
    !!profileShipping.postalCode &&
    !!profileShipping.country

  const hasProfilePayment =
    !!profilePayment.holderName &&
    !!profilePayment.last4 &&
    !!profilePayment.expiry

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // ======== ENVÍO ========
  const [useAltShipping, setUseAltShipping] = useState(!hasProfileShipping)
  const [shipping, setShipping] = useState({
    name: profileShipping.name,
    address: profileShipping.address,
    city: profileShipping.city,
    postalCode: profileShipping.postalCode,
    country: profileShipping.country
  })
  const [shippingErrors, setShippingErrors] = useState({})

  // refrescar prefills cuando venga el perfil y no esté en modo alternativo
  useEffect(() => {
    if (useAltShipping) return
    setShipping({
      name: profileShipping.name,
      address: profileShipping.address,
      city: profileShipping.city,
      postalCode: profileShipping.postalCode,
      country: profileShipping.country
    })
  }, [
    useAltShipping,
    profileShipping.name,
    profileShipping.address,
    profileShipping.city,
    profileShipping.postalCode,
    profileShipping.country
  ])

  const validateShipping = () => {
    if (!useAltShipping && hasProfileShipping) return true
    const e = {}
    if (!shipping.name.trim()) e.name = 'Este campo es obligatorio'
    if (!shipping.address.trim()) e.address = 'Este campo es obligatorio'
    if (!shipping.city.trim()) e.city = 'Este campo es obligatorio'
    if (!shipping.postalCode.trim()) e.postalCode = 'Este campo es obligatorio'
    if (!shipping.country.trim()) e.country = 'Este campo es obligatorio'
    setShippingErrors(e)
    return Object.keys(e).length === 0
  }

  // ======== PAGO ========
  const [useAltPayment, setUseAltPayment] = useState(!hasProfilePayment)
  const [payment, setPayment] = useState({
    holderName: profilePayment.holderName,
    cardNumber: '',
    cvc: '',
    expiry: ''
  })
  const [paymentErrors, setPaymentErrors] = useState({})

  // refrescar titular si el user cambia y no estamos en modo alternativo
  useEffect(() => {
    if (useAltPayment) return
    setPayment((p) => ({ ...p, holderName: profilePayment.holderName }))
  }, [useAltPayment, profilePayment.holderName])

  const brand = useMemo(
    () => detectBrand(digitsOnly(payment.cardNumber)),
    [payment.cardNumber]
  )

  const validatePayment = () => {
    if (!useAltPayment && hasProfilePayment) return true
    const e = {}

    if (!payment.holderName.trim()) e.holderName = 'Este campo es obligatorio'

    const digits = digitsOnly(payment.cardNumber)
    if (digits.length < 13 || digits.length > 19) {
      e.cardNumber = 'Debe contener entre 13 y 19 dígitos'
    } else if (!luhnCheck(digits)) {
      e.cardNumber = 'Tarjeta inválida'
    }

    if (!isValidExpiry(payment.expiry)) e.expiry = 'Caducidad inválida (MM/AA)'

    if (!isValidCVC(digitsOnly(payment.cvc), brand)) {
      e.cvc = brand === 'AMEX' ? 'CVC de 4 dígitos' : 'CVC de 3 dígitos'
    }

    setPaymentErrors(e)
    return Object.keys(e).length === 0
  }

  // ======== ENVÍO: opciones ========
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

  // ======== TOTALES ========
  const subtotal = cart.items.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  )
  const shippingCost = selectedShippingOption.extra
  const total = subtotal + shippingCost

  // ======== STEPS ========
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

  // ======== CONFIRMAR COMPRA ========
  const handleConfirm = async () => {
    setSubmitError(null)
    setSubmitting(true)
    try {
      const shippingAddress =
        useAltShipping || !hasProfileShipping
          ? {
              fullName: shipping.name,
              address: shipping.address,
              city: shipping.city,
              postalCode: shipping.postalCode,
              country: shipping.country
            }
          : {
              fullName: profileShipping.name,
              address: profileShipping.address,
              city: profileShipping.city,
              postalCode: profileShipping.postalCode,
              country: profileShipping.country
            }

      // Etiqueta de método (no guardamos tarjeta real)
      const last4Alt = digitsOnly(payment.cardNumber).slice(-4)
      const paymentMethod =
        useAltPayment || !hasProfilePayment
          ? last4Alt
            ? `Tarjeta •••• ${last4Alt}`
            : 'Tarjeta'
          : profilePayment.last4
          ? `Tarjeta •••• ${profilePayment.last4}`
          : 'Tarjeta'

      // 1) crear orden
      const { data: order } = await createOrder({
        shippingAddress,
        paymentMethod
      })

      // 2) marcar pagada
      const { data: paidOrder } = await payOrder(order._id)

      // 3) persistimos elección de envío para la pantalla de confirmación
      try {
        sessionStorage.setItem(
          'kbook:lastShippingOption',
          JSON.stringify(selectedShippingOption)
        )
      } catch (_) {}

      // 4) limpiar carrito cliente
      try {
        if (typeof cart.clear === 'function') cart.clear()
        else
          for (const it of [...cart.items]) removeItem(it.book._id, it.format)
      } catch (_) {}

      // 5) navegar a confirmación
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

      {/* ===== Paso 1: Envío ===== */}
      {step === 1 && (
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
                onChange={(e) => setUseAltShipping(e.target.checked)}
              />
              Usar otra dirección
            </label>
          )}

          <Field>
            <Label>Nombre completo</Label>
            <Input
              value={useAltShipping ? shipping.name : profileShipping.name}
              onChange={(e) =>
                useAltShipping &&
                setShipping((s) => ({ ...s, name: e.target.value }))
              }
              hasError={!!shippingErrors.name}
              disabled={!useAltShipping && hasProfileShipping}
            />
            {shippingErrors.name && (
              <ErrorText>{shippingErrors.name}</ErrorText>
            )}
          </Field>
          <Field>
            <Label>Dirección</Label>
            <Input
              value={
                useAltShipping ? shipping.address : profileShipping.address
              }
              onChange={(e) =>
                useAltShipping &&
                setShipping((s) => ({ ...s, address: e.target.value }))
              }
              hasError={!!shippingErrors.address}
              disabled={!useAltShipping && hasProfileShipping}
            />
            {shippingErrors.address && (
              <ErrorText>{shippingErrors.address}</ErrorText>
            )}
          </Field>
          <Field>
            <Label>Ciudad</Label>
            <Input
              value={useAltShipping ? shipping.city : profileShipping.city}
              onChange={(e) =>
                useAltShipping &&
                setShipping((s) => ({ ...s, city: e.target.value }))
              }
              hasError={!!shippingErrors.city}
              disabled={!useAltShipping && hasProfileShipping}
            />
            {shippingErrors.city && (
              <ErrorText>{shippingErrors.city}</ErrorText>
            )}
          </Field>
          <Field>
            <Label>Código postal</Label>
            <Input
              value={
                useAltShipping
                  ? shipping.postalCode
                  : profileShipping.postalCode
              }
              onChange={(e) =>
                useAltShipping &&
                setShipping((s) => ({ ...s, postalCode: e.target.value }))
              }
              hasError={!!shippingErrors.postalCode}
              disabled={!useAltShipping && hasProfileShipping}
            />
            {shippingErrors.postalCode && (
              <ErrorText>{shippingErrors.postalCode}</ErrorText>
            )}
          </Field>
          <Field>
            <Label>País</Label>
            <Input
              value={
                useAltShipping ? shipping.country : profileShipping.country
              }
              onChange={(e) =>
                useAltShipping &&
                setShipping((s) => ({ ...s, country: e.target.value }))
              }
              hasError={!!shippingErrors.country}
              disabled={!useAltShipping && hasProfileShipping}
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

      {/* ===== Paso 2: Pago ===== */}
      {step === 2 && (
        <FormSection>
          <h2>2. Información de pago</h2>

          {hasProfilePayment && (
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
                onChange={(e) => setUseAltPayment(e.target.checked)}
              />
              Usar otros datos de pago
            </label>
          )}

          <Field>
            <Label>Nombre del titular</Label>
            <Input
              value={
                useAltPayment ? payment.holderName : profilePayment.holderName
              }
              onChange={(e) =>
                useAltPayment &&
                setPayment((p) => ({ ...p, holderName: e.target.value }))
              }
              hasError={!!paymentErrors.holderName}
              disabled={!useAltPayment && hasProfilePayment}
              autoComplete='cc-name'
            />
            {paymentErrors.holderName && (
              <ErrorText>{paymentErrors.holderName}</ErrorText>
            )}
          </Field>

          <Field>
            <Label>Número de tarjeta {brand ? `(${brand})` : ''}</Label>
            <Input
              value={
                useAltPayment
                  ? payment.cardNumber
                  : profilePayment.last4
                  ? `•••• •••• •••• ${profilePayment.last4}`
                  : ''
              }
              onChange={(e) =>
                useAltPayment &&
                setPayment((p) => ({
                  ...p,
                  cardNumber: formatCardNumber(e.target.value) // 1234 5678 ...
                }))
              }
              hasError={!!paymentErrors.cardNumber}
              disabled={!useAltPayment && hasProfilePayment}
              placeholder={useAltPayment ? '1234 5678 9012 3456' : ''}
              inputMode='numeric'
              autoComplete='cc-number'
              onKeyDown={blockNonNumericKeys}
              onPaste={(e) => {
                if (!useAltPayment) return
                const text = (e.clipboardData || window.clipboardData).getData(
                  'text'
                )
                e.preventDefault()
                setPayment((p) => ({
                  ...p,
                  cardNumber: formatCardNumber(text)
                }))
              }}
              // máx. 19 dígitos + 3 espacios → 23 caracteres aprox
              maxLength={useAltPayment ? 23 : undefined}
            />
            {paymentErrors.cardNumber && (
              <ErrorText>{paymentErrors.cardNumber}</ErrorText>
            )}
          </Field>

          <Field>
            <Label>Fecha de caducidad (MM/AA)</Label>
            <Input
              value={useAltPayment ? payment.expiry : profilePayment.expiry}
              onChange={(e) =>
                useAltPayment &&
                setPayment((p) => ({
                  ...p,
                  expiry: formatExpiry(e.target.value)
                }))
              }
              hasError={!!paymentErrors.expiry}
              disabled={!useAltPayment && hasProfilePayment}
              placeholder={useAltPayment ? 'MM/AA' : ''}
              inputMode='numeric'
              autoComplete='cc-exp'
              onKeyDown={blockNonNumericKeys}
              onPaste={(e) => {
                if (!useAltPayment) return
                const text = (e.clipboardData || window.clipboardData).getData(
                  'text'
                )
                e.preventDefault()
                setPayment((p) => ({ ...p, expiry: formatExpiry(text) }))
              }}
              maxLength={5} // "MM/AA"
              onBlur={() => {
                // validación puntual al salir del campo
                if (!useAltPayment) return
                setPaymentErrors((prev) => ({
                  ...prev,
                  expiry: isValidExpiry(payment.expiry)
                    ? undefined
                    : 'Caducidad inválida (MM/AA)'
                }))
              }}
            />
            {paymentErrors.expiry && (
              <ErrorText>{paymentErrors.expiry}</ErrorText>
            )}
          </Field>

          <Field>
            <Label>CVC</Label>
            <Input
              value={useAltPayment ? payment.cvc : ''}
              onChange={(e) =>
                useAltPayment &&
                setPayment((p) => ({
                  ...p,
                  cvc: formatCVC(e.target.value, brand)
                }))
              }
              hasError={!!paymentErrors.cvc}
              disabled={!useAltPayment && hasProfilePayment}
              placeholder={
                useAltPayment ? (brand === 'AMEX' ? '****' : '***') : ''
              }
              inputMode='numeric'
              autoComplete='cc-csc'
              onKeyDown={blockNonNumericKeys}
              onPaste={(e) => {
                if (!useAltPayment) return
                const text = (e.clipboardData || window.clipboardData).getData(
                  'text'
                )
                e.preventDefault()
                setPayment((p) => ({
                  ...p,
                  cvc: formatCVC(text, brand)
                }))
              }}
              maxLength={brand === 'AMEX' ? 4 : 3}
              onBlur={() => {
                if (!useAltPayment) return
                setPaymentErrors((prev) => ({
                  ...prev,
                  cvc: isValidCVC(payment.cvc, brand)
                    ? undefined
                    : brand === 'AMEX'
                    ? 'CVC de 4 dígitos'
                    : 'CVC de 3 dígitos'
                }))
              }}
            />
            {paymentErrors.cvc && <ErrorText>{paymentErrors.cvc}</ErrorText>}
          </Field>

          <ButtonRow>
            <SecondaryButton onClick={handleBack}>Atrás</SecondaryButton>
            <PrimaryButton onClick={handleNext}>Siguiente</PrimaryButton>
          </ButtonRow>
        </FormSection>
      )}

      {/* ===== Paso 3: Revisión ===== */}
      {step === 3 && (
        <FormSection>
          <h2>3. Revisión y envío</h2>

          {/* === Parte superior: Resumen === */}
          <TopSummary style={{ marginTop: 12 }}>
            <SummaryCard>
              <h3 style={{ marginBottom: 8 }}>Datos de envío</h3>
              <LV>
                <b>Nombre:</b>
                <div>
                  {(useAltShipping ? shipping.name : profileShipping.name) ||
                    '—'}
                </div>
              </LV>
              <LV>
                <b>Dirección:</b>
                <div>
                  {(useAltShipping
                    ? shipping.address
                    : profileShipping.address) || '—'}
                </div>
              </LV>
              <LV>
                <b>Ciudad:</b>
                <div>
                  {(useAltShipping ? shipping.city : profileShipping.city) ||
                    '—'}
                </div>
              </LV>
              <LV>
                <b>Código postal:</b>
                <div>
                  {(useAltShipping
                    ? shipping.postalCode
                    : profileShipping.postalCode) || '—'}
                </div>
              </LV>
              <LV>
                <b>País:</b>
                <div>
                  {(useAltShipping
                    ? shipping.country
                    : profileShipping.country) || '—'}
                </div>
              </LV>
            </SummaryCard>

            <SummaryCard>
              <h3 style={{ marginBottom: 8 }}>Pago y envío</h3>
              <LV>
                <b>Titular:</b>
                <div>
                  {(useAltPayment
                    ? payment.holderName
                    : profilePayment.holderName) || '—'}
                </div>
              </LV>
              <LV>
                <b>Tarjeta:</b>
                <div>
                  {useAltPayment
                    ? digitsOnly(payment.cardNumber).slice(-4)
                      ? `•••• •••• •••• ${digitsOnly(payment.cardNumber).slice(
                          -4
                        )}`
                      : '—'
                    : profilePayment.last4
                    ? `•••• •••• •••• ${profilePayment.last4}`
                    : '—'}
                </div>
              </LV>
              <LV>
                <b>Caducidad:</b>
                <div>
                  {(useAltPayment ? payment.expiry : profilePayment.expiry) ||
                    '—'}
                </div>
              </LV>

              <div style={{ marginTop: 10 }}>
                <Label style={{ marginBottom: 6 }}>Opción de envío</Label>
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
                <Note>{selectedShippingOption.description}</Note>
              </div>
            </SummaryCard>
          </TopSummary>

          {/* === Parte del medio: ejemplares adquiridos === */}
          <div style={{ marginTop: 24 }}>
            <h3>Ejemplares adquiridos</h3>
            <ItemsGrid style={{ marginTop: 12 }}>
              {(cart?.items ?? []).map((it, idx) => {
                const b = it?.book

                // ID seguro para la key (acepta objeto, string o fallback)
                const bid =
                  (b && (b._id || b.id)) ||
                  (typeof b === 'string' ? b : null) ||
                  `idx-${idx}`
                const key = `${bid}-${it?.format || 'n/a'}-${idx}`

                // Título y portada con fallback
                const title =
                  (b && typeof b === 'object' && (b.title || b.name)) ||
                  it?.title ||
                  'Libro'
                const cover =
                  (b && typeof b === 'object' && b.coverImage) ||
                  it?.coverImage ||
                  ''

                const qty = Number(it?.quantity || 0)
                const priceNum = Number(it?.price || 0) * qty
                const price = Number.isFinite(priceNum)
                  ? priceNum.toFixed(2)
                  : '0.00'

                return (
                  <ItemCard key={key}>
                    <Cover>
                      {cover ? (
                        <img src={cover} alt={`Portada de ${title}`} />
                      ) : null}
                    </Cover>
                    <ItemTitle>{title}</ItemTitle>
                    <PriceRow>
                      <div>Cantidad: {qty}</div>
                      <div>{price} €</div>
                    </PriceRow>
                  </ItemCard>
                )
              })}
            </ItemsGrid>

            {/* Totales debajo del grid */}
            <SummaryBox>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 8
                }}
              >
                <div>Subtotal</div>
                <div>{subtotal.toFixed(2)} €</div>
                <div>Envío</div>
                <div>{shippingCost.toFixed(2)} €</div>
                <div style={{ fontWeight: 700 }}>Total</div>
                <div style={{ fontWeight: 700 }}>{total.toFixed(2)} €</div>
              </div>
            </SummaryBox>
          </div>

          {/* === Parte inferior: llegada + agradecimiento === */}
          {(() => {
            const baseDate = new Date()
            const isFast = selectedShippingOption.key === 'fast'
            const windowTxt = isFast
              ? format(addBusinessDays(baseDate, 2), 'dd MMM yyyy')
              : `${format(
                  addBusinessDays(baseDate, 5),
                  'dd MMM yyyy'
                )} - ${format(addBusinessDays(baseDate, 6), 'dd MMM yyyy')}`
            const plural = cart.items.length > 1
            return (
              <div style={{ marginTop: 24 }}>
                <h3>
                  {plural ? 'Sus ejemplares llegarán…' : 'Su ejemplar llegará…'}
                </h3>
                <p style={{ marginTop: 6 }}>{windowTxt}</p>
                <Note>
                  ¡Gracias por su compra! En Kbook apreciamos su confianza.
                </Note>
              </div>
            )
          })()}

          {submitError && (
            <div style={{ color: 'red', marginTop: 12 }}>{submitError}</div>
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
