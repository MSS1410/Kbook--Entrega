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

// import components
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

// Helpers local

//Solo digitos en cadena
const digitsOnly = (v) => (v || '').replace(/\D+/g, '')

// formatea a 19 digitos, 4 espacio 4
const formatCardNumber = (raw) =>
  digitsOnly(raw)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim()

// implemento checkOut en 3 pasos: Envio , Pago , Revision
// Envio - Direccion de entrega
// Pago - Datos Trjeta o guardados perfil
// revision - resumen del pedido , eleccion entrega, totales finales y confirm

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, removeItem } = useCart()
  const { user, setUser } = useAuth()

  // Carga de perfil
  useEffect(() => {
    const needs =
      !user || // si no hay user
      typeof user.address === 'undefined' || // faltan campos de envio
      (user?.payment == null && user?.cardNumber == null) // faltan datos de pago
    if (needs) {
      ;(async () => {
        try {
          const { data } = await api.get('/api/users/profile') // get perfil complet
          if (data?.user) setUser(data.user) // actualiza contexto usuer
        } catch (_) {}
      })()
    }
  }, [user, setUser])

  // PreRellenado si tengo los datos from profile, en todos admitiremos el plano y el anidado de profile

  // prerellenado desde perfil - envio
  const profileShipping = {
    name: user?.name || '',
    address: user?.address || user?.shipping?.address || '',
    city: user?.city || user?.shipping?.city || '',
    postalCode: user?.postalCode || user?.shipping?.postalCode || '',
    country: user?.country || user?.shipping?.country || ''
  }

  // rellenado desde perfil  : pago
  const profilePayment = {
    holderName:
      user?.payment?.cardHolderName || user?.holderName || user?.name || '',
    last4:
      user?.payment?.last4 || // last 4 saved on server
      (user?.cardNumber ? user.cardNumber.replace(/\D+/g, '').slice(-4) : ''),
    expiry: user?.payment?.expiry || user?.expiry || '' // saved expir date
  }
  // flags, si hay datos de perfil los pasamos sin tener q editar
  const hasProfileShipping =
    !!profileShipping.address &&
    !!profileShipping.city &&
    !!profileShipping.postalCode &&
    !!profileShipping.country

  const hasProfilePayment =
    !!profilePayment.holderName &&
    !!profilePayment.last4 &&
    !!profilePayment.expiry

  // paso del wizard  1envio  2pago  3revision
  // estado 1 Envio
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false) // mientras confirmo pedido
  const [submitError, setSubmitError] = useState(null)

  // Envio

  const [useAltShipping, setUseAltShipping] = useState(!hasProfileShipping)
  // ofrecemos usuario posibilidad de  introducir nueva direccion o por default
  const [shipping, setShipping] = useState({
    // editable , inicial copia perfil
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

  // validacion de envio
  const validateShipping = () => {
    if (!useAltShipping && hasProfileShipping) return true // si usamos perfil i es OK -> directo
    const e = {}
    if (!shipping.name.trim()) e.name = 'Este campo es obligatorio'
    if (!shipping.address.trim()) e.address = 'Este campo es obligatorio'
    if (!shipping.city.trim()) e.city = 'Este campo es obligatorio'
    if (!shipping.postalCode.trim()) e.postalCode = 'Este campo es obligatorio'
    if (!shipping.country.trim()) e.country = 'Este campo es obligatorio'
    setShippingErrors(e)
    return Object.keys(e).length === 0
  }

  // estado pago (2)
  const [useAltPayment, setUseAltPayment] = useState(!hasProfilePayment) // otros datos ?
  const [payment, setPayment] = useState({
    // editables
    holderName: profilePayment.holderName, // rellenado aut
    cardNumber: '',
    cvc: '',
    expiry: ''
  })

  const [paymentErrors, setPaymentErrors] = useState({}) // err

  const brand = useMemo(
    // Detecta marca, VISA , MC , ANEX
    () => detectBrand(digitsOnly(payment.cardNumber)),
    [payment.cardNumber]
  )

  // Refrescar titular desde perfil si no USA el editable
  useEffect(() => {
    if (useAltPayment) return
    setPayment((p) => ({ ...p, holderName: profilePayment.holderName }))
  }, [useAltPayment, profilePayment.holderName])

  // Validacion de Pago
  const validatePayment = () => {
    if (!useAltPayment && hasProfilePayment) return true // Si perfil valido -> directo
    const e = {}
    if (!payment.holderName.trim()) e.holderName = 'Este campo es obligatorio'

    const digits = digitsOnly(payment.cardNumber) // solo digitos para validar
    if (digits.length < 13 || digits.length > 19) {
      e.cardNumber = 'Debe contener entre 13 y 19 dígitos'
    } else if (!luhnCheck(digits)) {
      e.cardNumber = 'Tarjeta inválida' // LUHN
    }

    if (!isValidExpiry(payment.expiry)) e.expiry = 'Caducidad inválida (MM/AA)' //CHeck de length de num card para permitir valido cvc

    if (!isValidCVC(digitsOnly(payment.cvc), brand)) {
      e.cvc = brand === 'AMEX' ? 'CVC de 4 dígitos' : 'CVC de 3 dígitos'
    }
    setPaymentErrors(e)
    return Object.keys(e).length === 0
  }

  //Opciones de envio
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
    shippingOptions[0] // por default -> sin coste
  )

  //  Totales
  const subtotal = cart.items.reduce(
    // suma precio + cantidad de cada item
    (sum, it) => sum + it.price * it.quantity,
    0
  )
  const shippingCost = selectedShippingOption.extra // coste por opcion
  const total = subtotal + shippingCost // añade si hay coste envio

  // Pasar al siguiente step
  const handleNext = () => {
    if (step === 1) {
      if (!validateShipping()) return // de envio a pago
      setStep(2)
    } else if (step === 2) {
      if (!validatePayment()) return // de Pago a sRevision
      setStep(3)
    }
  }

  //<-
  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1) // back 1step si no esta en el 1r paso
  }

  // Confirmar compra
  const handleConfirm = async () => {
    setSubmitError(null) // limpia
    setSubmitting(true) // bloqueo boton
    try {
      // 1 - Construir direcc final ,
      const shippingAddress =
        useAltShipping || !hasProfileShipping // usa la q el usuario ha escrito en el momento
          ? {
              fullName: shipping.name,
              address: shipping.address,
              city: shipping.city,
              postalCode: shipping.postalCode,
              country: shipping.country
            }
          : {
              fullName: profileShipping.name, // usa la de perfil antigua
              address: profileShipping.address,
              city: profileShipping.city,
              postalCode: profileShipping.postalCode,
              country: profileShipping.country
            }

      // 2 - Etiqueta meotodo pago
      const last4Alt = digitsOnly(payment.cardNumber).slice(-4) // si nuevo, tomar 4 digitos si hay
      const paymentMethod =
        useAltPayment || !hasProfilePayment
          ? last4Alt
            ? `Tarjeta •••• ${last4Alt}` // mask
            : 'Tarjeta'
          : profilePayment.last4
          ? `Tarjeta •••• ${profilePayment.last4}` // with profile use last 4
          : 'Tarjeta'

      // 3 -  Crear y Pagar orden - apis
      const { data: order } = await createOrder({
        shippingAddress,
        paymentMethod
      })
      const { data: paidOrder } = await payOrder(order._id)

      // 4 . persisitir opcion de envio
      try {
        sessionStorage.setItem(
          'kbook:lastShippingOption',
          JSON.stringify(selectedShippingOption)
        )
      } catch (_) {}

      //5 -  Limpiar carrito cliente
      try {
        if (typeof cart.clear === 'function') cart.clear() // si tengo clear uso
        else
          for (const it of [...cart.items]) removeItem(it.book._id, it.format) // cada item removeItem
      } catch (_) {}

      // 6 - IR a confirmacion
      navigate('/order-confirm', {
        state: { order: paidOrder, shippingOption: selectedShippingOption }
      })
    } catch (e) {
      console.error('Error al finalizar compra', e)
      setSubmitError(
        e?.response?.data?.message || 'No pudimos procesar tu compra.'
      )
    } finally {
      setSubmitting(false) // devuelvo boton
    }
  }

  return (
    // flujo del wzrd
    <Container>
      {/* layout princ */}
      <h1>Compra</h1>

      <StepBar step={step} />
      {/* barra de pasos
      
      */}
      {/* 1 - ENVIO */}
      {step === 1 && (
        <ShippingForm
          hasProfileShipping={hasProfileShipping} //datos de perfil para no editar?
          useAltShipping={useAltShipping} // usar otra dire ?
          onToggleAlt={setUseAltShipping} // activo edicion
          // valores a mostrar segun editado o perfil
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
          editable={useAltShipping || !hasProfileShipping} // inputs habilitados si edita o no tiene datos en el perfil
          onChange={(key, val) => setShipping((s) => ({ ...s, [key]: val }))} // act editados
          onBack={handleBack} // back no funciona en paso 1
          onNext={handleNext} // valida y pasa a 2
        />
      )}

      {/* 2 PAGO */}
      {step === 2 && (
        <PaymentForm
          hasProfilePayment={hasProfilePayment} //perfil pago valido?
          useAltPayment={useAltPayment} // otros datos?
          onToggleAlt={setUseAltPayment} // edit mode
          brand={brand} // clasifico marca
          // valores a mostrar segun caso
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
          formatCardNumber={formatCardNumber} // hlp para formato
          onChange={(key, val) => setPayment((p) => ({ ...p, [key]: val }))}
          setErrors={setPaymentErrors}
          onBack={handleBack} // 1 <-
          onNext={handleNext} // -> 2
        />
      )}

      {/* 3 REVISION */}
      {step === 3 && (
        <ReviewStep
          // datos de envio a mostrar
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
          // datos para el pago (last4)

          paymentDisplay={{
            holderName: useAltPayment
              ? payment.holderName
              : profilePayment.holderName,

            last4: useAltPayment
              ? digitsOnly(payment.cardNumber).slice(-4)
              : profilePayment.last4,

            expiry: useAltPayment ? payment.expiry : profilePayment.expiry
          }}
          // opcion para seleccionar tipo de envio
          shippingOptions={shippingOptions}
          selectedShippingOption={selectedShippingOption}
          onChangeShippingOption={(key) => {
            const opt =
              shippingOptions.find((o) => o.key === key) || shippingOptions[0]

            setSelectedShippingOption(opt)
          }}
          // totales y cart
          items={cart?.items ?? []}
          subtotal={subtotal}
          shippingCost={shippingCost}
          total={total}
          // estados submit
          submitError={submitError}
          submitting={submitting}
          // nav
          onBack={handleBack}
          onConfirm={handleConfirm}
        />
      )}
    </Container>
  )
}
