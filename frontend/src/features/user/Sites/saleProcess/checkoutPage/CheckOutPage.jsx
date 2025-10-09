// CheckoutPage.jsx
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import useCart from '../../../../../hooks/useCart'
import useAuth from '../../../../../hooks/useAuth'
import { createOrder, payOrder } from '../../../../../api/orders'
import api from '../../../../../api/index'
import {
  luhnCheck,
  detectBrand,
  isValidExpiry,
  isValidCVC
} from '../../../../../utils/validators'

// Presentacionales (solo UI)
import StepBar from './checkoutComponents/StepBar'
import ShippingForm from './checkoutComponents/ShippingForm'
import PaymentForm from './checkoutComponents/PaymentForm'
import ReviewStep from './checkoutComponents/ReviewStep'

const Container = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`

// Helpers locales
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

  // Carga de perfil si faltan datos
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

  // Prefills desde perfil (admite plano y anidado)
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

  // ===== Envío =====
  const [useAltShipping, setUseAltShipping] = useState(!hasProfileShipping)
  const [shipping, setShipping] = useState({
    name: profileShipping.name,
    address: profileShipping.address,
    city: profileShipping.city,
    postalCode: profileShipping.postalCode,
    country: profileShipping.country
  })
  const [shippingErrors, setShippingErrors] = useState({})

  // Refrescar prefills cuando cambie perfil y no esté modo alterno
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

  // ===== Pago =====
  const [useAltPayment, setUseAltPayment] = useState(!hasProfilePayment)
  const [payment, setPayment] = useState({
    holderName: profilePayment.holderName,
    cardNumber: '',
    cvc: '',
    expiry: ''
  })
  const [paymentErrors, setPaymentErrors] = useState({})
  const brand = useMemo(
    () => detectBrand(digitsOnly(payment.cardNumber)),
    [payment.cardNumber]
  )
  // Refrescar titular desde perfil si no está en alterno
  useEffect(() => {
    if (useAltPayment) return
    setPayment((p) => ({ ...p, holderName: profilePayment.holderName }))
  }, [useAltPayment, profilePayment.holderName])

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

  // ===== Envío: opciones =====
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

  // ===== Totales =====
  const subtotal = cart.items.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  )
  const shippingCost = selectedShippingOption.extra
  const total = subtotal + shippingCost

  // Navegación de pasos
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

  // Confirmar compra
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

      // Etiqueta método (no guardamos tarjeta real)
      const last4Alt = digitsOnly(payment.cardNumber).slice(-4)
      const paymentMethod =
        useAltPayment || !hasProfilePayment
          ? last4Alt
            ? `Tarjeta •••• ${last4Alt}`
            : 'Tarjeta'
          : profilePayment.last4
          ? `Tarjeta •••• ${profilePayment.last4}`
          : 'Tarjeta'

      const { data: order } = await createOrder({
        shippingAddress,
        paymentMethod
      })
      const { data: paidOrder } = await payOrder(order._id)

      // Persistir opción de envío
      try {
        sessionStorage.setItem(
          'kbook:lastShippingOption',
          JSON.stringify(selectedShippingOption)
        )
      } catch (_) {}

      // Limpiar carrito cliente (compatibilidad con firma distinta)
      try {
        if (typeof cart.clear === 'function') cart.clear()
        else
          for (const it of [...cart.items]) removeItem(it.book._id, it.format)
      } catch (_) {}

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

      <StepBar step={step} />

      {/* Paso 1: Envío */}
      {step === 1 && (
        <ShippingForm
          hasProfileShipping={hasProfileShipping}
          useAltShipping={useAltShipping}
          onToggleAlt={setUseAltShipping}
          // valores visibles (prefill vs alterno)
          values={{
            name: useAltShipping ? shipping.name : profileShipping.name,
            address: useAltShipping
              ? shipping.address
              : profileShipping.address,
            city: useAltShipping ? shipping.city : profileShipping.city,
            postalCode: useAltShipping
              ? shipping.postalCode
              : profileShipping.postalCode,
            country: useAltShipping ? shipping.country : profileShipping.country
          }}
          errors={shippingErrors}
          editable={useAltShipping || !hasProfileShipping}
          onChange={(key, val) => setShipping((s) => ({ ...s, [key]: val }))}
          onBack={handleBack}
          onNext={handleNext}
        />
      )}

      {/* Paso 2: Pago */}
      {step === 2 && (
        <PaymentForm
          hasProfilePayment={hasProfilePayment}
          useAltPayment={useAltPayment}
          onToggleAlt={setUseAltPayment}
          brand={brand}
          // valores visibles
          values={{
            holderName: useAltPayment
              ? payment.holderName
              : profilePayment.holderName,
            cardNumber: useAltPayment
              ? payment.cardNumber
              : profilePayment.last4
              ? `•••• •••• •••• ${profilePayment.last4}`
              : '',
            expiry: useAltPayment ? payment.expiry : profilePayment.expiry,
            cvc: useAltPayment ? payment.cvc : ''
          }}
          errors={paymentErrors}
          editable={useAltPayment || !hasProfilePayment}
          formatCardNumber={formatCardNumber}
          onChange={(key, val) => setPayment((p) => ({ ...p, [key]: val }))}
          setErrors={setPaymentErrors}
          onBack={handleBack}
          onNext={handleNext}
        />
      )}

      {/* Paso 3: Revisión */}
      {step === 3 && (
        <ReviewStep
          shippingDisplay={{
            name: useAltShipping ? shipping.name : profileShipping.name,
            address: useAltShipping
              ? shipping.address
              : profileShipping.address,
            city: useAltShipping ? shipping.city : profileShipping.city,
            postalCode: useAltShipping
              ? shipping.postalCode
              : profileShipping.postalCode,
            country: useAltShipping ? shipping.country : profileShipping.country
          }}
          paymentDisplay={{
            holderName: useAltPayment
              ? payment.holderName
              : profilePayment.holderName,
            last4: useAltPayment
              ? digitsOnly(payment.cardNumber).slice(-4)
              : profilePayment.last4,
            expiry: useAltPayment ? payment.expiry : profilePayment.expiry
          }}
          shippingOptions={shippingOptions}
          selectedShippingOption={selectedShippingOption}
          onChangeShippingOption={(key) => {
            const opt =
              shippingOptions.find((o) => o.key === key) || shippingOptions[0]
            setSelectedShippingOption(opt)
          }}
          items={cart?.items ?? []}
          subtotal={subtotal}
          shippingCost={shippingCost}
          total={total}
          submitError={submitError}
          submitting={submitting}
          onBack={handleBack}
          onConfirm={handleConfirm}
        />
      )}
    </Container>
  )
}
