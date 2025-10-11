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

// Components
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

// Helpers
const digitsOnly = (v) => (v || '').replace(/\D+/g, '') // Deja solo dígitos.

const formatCardNumber = (raw) =>
  digitsOnly(raw)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim()
const maskLast4 = (
  last4 = '' // Muestra “•••• •••• •••• 1234”
) => (last4 ? `•••• •••• •••• ${String(last4).slice(-4)}` : '—')

export default function OrderConfirmPage() {
  const { user, setUser } = useAuth() // perfil del usuario
  const { state } = useLocation() // recoge datos pasados por checkout

  const order = state?.order || null // pedido creado o pagado recien
  const shippingOption = state?.shippingOption || null

  // rellenado  desde /profile si faltan campos
  useEffect(() => {
    const needsProfile = // indica si recargar profile
      !user ||
      !user.shipping ||
      !user.payment ||
      typeof user.shipping.address === 'undefined' ||
      typeof user.payment.last4 === 'undefined'
    if (needsProfile) {
      ;(async () => {
        try {
          const { data } = await api.get('/api/users/profile') // carga de perfil actualizado
          if (data?.user) setUser(data.user) // rellena contexto d usuario
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

  //  Estado local por si quiere re editr campos, no backend
  const profileShip = user?.shipping || {} // envio segun perfil
  const orderShip = order?.shippingAddress || {} // envio segun pedido generada
  const [useAltShipping, setUseAltShipping] = useState(false) // otra direccion, local
  const [shipForm, setShipForm] = useState({
    // form de envio a mostrar si actualiza direccion
    fullName: user?.name || '',
    address: profileShip.address || orderShip.address || '',
    city: profileShip.city || orderShip.city || '',
    postalCode: profileShip.postalCode || orderShip.postalCode || '',
    country: profileShip.country || orderShip.country || ''
  })
  const [shipErrors, setShipErrors] = useState({})

  useEffect(() => {
    //
    if (useAltShipping) return // si usa otra direccin, no rehidrato
    setShipForm((prev) => ({
      // sin editado, reflejar pedido y orden actuales
      ...prev,
      fullName: user?.name || prev.fullName || '',
      address: profileShip.address || orderShip.address || '',
      city: profileShip.city || orderShip.city || '',
      postalCode: profileShip.postalCode || orderShip.postalCode || '',
      country: profileShip.country || orderShip.country || ''
    }))
  }, [user, order, useAltShipping])

  const validateShipping = () => {
    // validacion del form por edicion
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

  const [useAltPayment, setUseAltPayment] = useState(false) // usar otro metodo de pago
  const [payForm, setPayForm] = useState({
    // form editable
    holderName: user?.payment?.cardHolderName || user?.name || '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  })
  useEffect(() => {
    if (useAltPayment) return // sin edicion
    setPayForm((f) => ({
      ...f,
      holderName: user?.payment?.cardHolderName || user?.name || '' // mantenemos sincro con perfil
    }))
  }, [user, useAltPayment])

  const brand = useMemo(
    () => detectBrand(digitsOnly(payForm.cardNumber)),
    [payForm.cardNumber]
  )
  const [payErrors, setPayErrors] = useState({})

  const validatePayment = () => {
    // validacion required solo si he editado
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
  const items = Array.isArray(order.items) ? order.items : [] // ejemplares comprados
  const shippingKey = (shippingOption && shippingOption.key) || 'standard' // key de envio
  const shippingLabel = // etiqueta info
    shippingOption?.label ||
    (shippingKey === 'fast'
      ? 'Entrega rápida (2 días laborables)'
      : 'Entrega estándar (5-6 días laborables)')
  const baseDate = new Date() //  ahora para calculo de entrega
  const estimatedWindow = // fecha, segun elección
    shippingKey === 'fast'
      ? format(addBusinessDays(baseDate, 2), 'dd MMM yyyy')
      : `${format(addBusinessDays(baseDate, 5), 'dd MMM yyyy')} - ${format(
          addBusinessDays(baseDate, 6),
          'dd MMM yyyy'
        )}`

  const deliveryPhrase =
    // segun elección plural o singular.
    (items.length > 1 ? 'Sus ejemplares llegarán ' : 'Su ejemplar llegará ') +
    estimatedWindow

  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0)
  const shippingCost = Number(shippingOption?.extra || 0) // coste add sobre el envio
  const total = subtotal + shippingCost // final suma

  // const confirmLocalChoices = () => {
  //   const okShip = validateShipping()
  //   const okPay = validatePayment()
  //   if (okShip && okPay) {
  //     alert('Datos verificados. (Nota: esto no modifica tu perfil ni la orden)')
  //   }
  // }

  return (
    <Container>
      <Title>
        ¡Gracias por su compra, {shipForm.fullName || user?.name || 'lector/a'}!
      </Title>

      {/* Envio y pago con edidcion */}
      <ShippingSection
        useAltShipping={useAltShipping} // checkbox usar otra
        onToggle={setUseAltShipping} // seter checkbox
        form={shipForm} //edicion o valores q tenemos
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
