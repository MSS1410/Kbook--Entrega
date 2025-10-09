// OrderConfirmPage.jsx
import React, { useMemo, useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import styled from 'styled-components'
import { addBusinessDays, format } from 'date-fns'
import useAuth from '../../../../../hooks/useAuth'
import api from '../../../../../api/index'
import {
  luhnCheck,
  detectBrand,
  isValidExpiry,
  isValidCVC
} from '../../../../../utils/validators'

// Presentacionales
import ShippingSection from './orderComponents/ShippingSection'
import PaymentSection from './orderComponents/PaymentSection'
import ReviewAndTotals from './orderComponents/ReviewAndTotals'

const Container = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: ${({ theme }) => theme.spacing.lg};
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`
const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
`
const Title = styled.h1`
  margin: 0;
`

// Helpers locales
const digitsOnly = (v) => (v || '').replace(/\D+/g, '')
const formatCardNumber = (raw) =>
  digitsOnly(raw)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim()
const maskLast4 = (last4 = '') =>
  last4 ? `•••• •••• •••• ${String(last4).slice(-4)}` : '—'

export default function OrderConfirmPage() {
  const { user, setUser } = useAuth()
  const { state } = useLocation()

  const order = state?.order || null
  const shippingOption = state?.shippingOption || null

  // Prefill robusto desde /profile si faltan campos
  useEffect(() => {
    const needsProfile =
      !user ||
      !user.shipping ||
      !user.payment ||
      typeof user.shipping.address === 'undefined' ||
      typeof user.payment.last4 === 'undefined'
    if (needsProfile) {
      ;(async () => {
        try {
          const { data } = await api.get('/api/users/profile')
          if (data?.user) setUser(data.user)
        } catch (_) {}
      })()
    }
  }, [user, setUser])

  if (!order) {
    return (
      <Container>
        <Card>
          <Title>¡Compra realizada!</Title>
          <p>Tu pedido se ha procesado correctamente.</p>
          <p>
            Puedes ver tus libros en la sección <b>Mis Libros</b>.
          </p>
          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            <Link to='/my-books'>Ver mis libros</Link>
            <Link to='/'>Volver al inicio</Link>
          </div>
        </Card>
      </Container>
    )
  }

  // ===== Estado local edición puntual (no persiste en backend) =====
  const profileShip = user?.shipping || {}
  const orderShip = order?.shippingAddress || {}
  const [useAltShipping, setUseAltShipping] = useState(false)
  const [shipForm, setShipForm] = useState({
    fullName: user?.name || '',
    address: profileShip.address || orderShip.address || '',
    city: profileShip.city || orderShip.city || '',
    postalCode: profileShip.postalCode || orderShip.postalCode || '',
    country: profileShip.country || orderShip.country || ''
  })
  const [shipErrors, setShipErrors] = useState({})

  useEffect(() => {
    if (useAltShipping) return
    setShipForm((prev) => ({
      ...prev,
      fullName: user?.name || prev.fullName || '',
      address: profileShip.address || orderShip.address || '',
      city: profileShip.city || orderShip.city || '',
      postalCode: profileShip.postalCode || orderShip.postalCode || '',
      country: profileShip.country || orderShip.country || ''
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, order, useAltShipping])

  const validateShipping = () => {
    if (!useAltShipping) return true
    const e = {}
    if (!shipForm.fullName.trim()) e.fullName = 'Nombre obligatorio.'
    if (!shipForm.address.trim()) e.address = 'Dirección obligatoria.'
    if (!shipForm.city.trim()) e.city = 'Ciudad obligatoria.'
    if (!shipForm.postalCode.trim()) e.postalCode = 'Código postal obligatorio.'
    if (!shipForm.country.trim()) e.country = 'País obligatorio.'
    setShipErrors(e)
    return Object.keys(e).length === 0
  }

  const [useAltPayment, setUseAltPayment] = useState(false)
  const [payForm, setPayForm] = useState({
    holderName: user?.payment?.cardHolderName || user?.name || '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  })
  useEffect(() => {
    if (useAltPayment) return
    setPayForm((f) => ({
      ...f,
      holderName: user?.payment?.cardHolderName || user?.name || ''
    }))
  }, [user, useAltPayment])

  const brand = useMemo(
    () => detectBrand(digitsOnly(payForm.cardNumber)),
    [payForm.cardNumber]
  )
  const [payErrors, setPayErrors] = useState({})

  const validatePayment = () => {
    if (!useAltPayment) return true
    const e = {}
    if (!payForm.holderName.trim()) e.holderName = 'Titular obligatorio.'
    const digits = digitsOnly(payForm.cardNumber)
    if (digits.length < 13 || digits.length > 19)
      e.cardNumber = 'Debe contener entre 13 y 19 dígitos.'
    else if (!luhnCheck(digits)) e.cardNumber = 'Tarjeta inválida.'
    if (!isValidExpiry(payForm.expiry)) e.expiry = 'Caducidad inválida (MM/AA).'
    if (!isValidCVC(digitsOnly(payForm.cvc), brand)) {
      e.cvc = brand === 'AMEX' ? 'CVC de 4 dígitos.' : 'CVC de 3 dígitos.'
    }
    setPayErrors(e)
    return Object.keys(e).length === 0
  }

  // Datos de entrega / totales
  const items = Array.isArray(order.items) ? order.items : []
  const shippingKey = (shippingOption && shippingOption.key) || 'standard'
  const shippingLabel =
    shippingOption?.label ||
    (shippingKey === 'fast'
      ? 'Entrega rápida (2 días laborables)'
      : 'Entrega estándar (5-6 días laborables)')
  const baseDate = new Date()
  const estimatedWindow =
    shippingKey === 'fast'
      ? format(addBusinessDays(baseDate, 2), 'dd MMM yyyy')
      : `${format(addBusinessDays(baseDate, 5), 'dd MMM yyyy')} - ${format(
          addBusinessDays(baseDate, 6),
          'dd MMM yyyy'
        )}`
  const deliveryPhrase =
    (items.length > 1 ? 'Sus ejemplares llegarán ' : 'Su ejemplar llegará ') +
    estimatedWindow

  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0)
  const shippingCost = Number(shippingOption?.extra || 0)
  const total = subtotal + shippingCost

  const confirmLocalChoices = () => {
    const okShip = validateShipping()
    const okPay = validatePayment()
    if (okShip && okPay) {
      alert('Datos verificados. (Nota: esto no modifica tu perfil ni la orden)')
    }
  }

  return (
    <Container>
      <Title>
        ¡Gracias por su compra, {shipForm.fullName || user?.name || 'lector/a'}!
      </Title>

      {/* Envío y Pago (editables localmente) */}
      <ShippingSection
        useAltShipping={useAltShipping}
        onToggle={setUseAltShipping}
        form={shipForm}
        errors={shipErrors}
        onChange={(key, val) => setShipForm((f) => ({ ...f, [key]: val }))}
      />
      <PaymentSection
        useAltPayment={useAltPayment}
        onToggle={setUseAltPayment}
        brand={brand}
        form={payForm}
        errors={payErrors}
        onChange={(key, val) => setPayForm((f) => ({ ...f, [key]: val }))}
        setErrors={setPayErrors}
        formatCardNumber={formatCardNumber}
        maskLast4={maskLast4}
        user={user}
      />

      {/* Revisión (datos mostrados + totales) */}
      <ReviewAndTotals
        shipForm={shipForm}
        useAltPayment={useAltPayment}
        payForm={payForm}
        user={user}
        order={order}
        shippingLabel={shippingLabel}
        deliveryPhrase={deliveryPhrase}
        subtotal={subtotal}
        shippingCost={shippingCost}
        total={total}
      />

      <div>
        <div style={{ marginTop: 8 }}>
          <Link to='/'>Volver al inicio</Link>
        </div>
      </div>
    </Container>
  )
}
