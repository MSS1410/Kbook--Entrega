import React, { useMemo, useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import styled from 'styled-components'
import { addBusinessDays, format } from 'date-fns'
import useAuth from '../../../hooks/useAuth'
import api from '../../../api/index'
import {
  luhnCheck,
  detectBrand,
  isValidExpiry,
  isValidCVC
} from '../../../utils/validators'

/* ================ Estilos ================ */
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
const H2 = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`
const GridTwo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`
const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`
const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
`
const Bold = styled.span`
  font-weight: bold;
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
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing.md};
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
const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
`

/* ==== Nuevos estilos para B3 (presentación más clara) ==== */
const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`
const DetailsCard = styled.div`
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
const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: baseline;
  gap: 12px; /* ← reducimos separación nombre ↔ precio */
  margin-bottom: 6px;
`
const Divider = styled.hr`
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing.md} 0;
`

/* ================ Helpers locales ================ */
const digitsOnly = (v) => (v || '').replace(/\D+/g, '')
const formatCardNumber = (raw) =>
  digitsOnly(raw)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim()
const formatExpiry = (raw) => {
  const d = digitsOnly(raw).slice(0, 4)
  if (!d) return ''
  let mm = d.slice(0, 2),
    yy = d.slice(2)
  if (mm.length === 2) {
    const n = parseInt(mm, 10)
    if (n === 0) mm = '01'
    else if (n > 12) mm = '12'
  }
  return yy ? `${mm}/${yy}` : mm.length === 2 ? `${mm}/` : mm
}
const maskLast4 = (last4 = '') =>
  last4 ? `•••• •••• •••• ${String(last4).slice(-4)}` : '—'
const itemTitle = (it) => it?.book?.title || it?.title || it?.name

/* ================ Página ================ */
export default function OrderConfirmPage() {
  const { user, setUser } = useAuth()
  const { state } = useLocation()

  // Orden y opción de envío que nos manda el checkout
  const order = state?.order || null
  const shippingOption = state?.shippingOption || null

  // ===== Prefill robusto: si el user del contexto no trae shipping/payment, pedimos /profile =====
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
        } catch (e) {
          // No bloqueamos la UI por esto.
          console.warn('No se pudo refrescar el perfil para prefill.')
        }
      })()
    }
  }, [user, setUser])

  // Envío: perfil → orden → vacío
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

  // Cuando llega/actualiza el user o la order, y NO está activado el modo alternativo, refrescamos prefills
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

  // Pago: mostramos lo guardado en perfil + opción de otros datos
  const [useAltPayment, setUseAltPayment] = useState(false)
  const [payForm, setPayForm] = useState({
    holderName: user?.payment?.cardHolderName || user?.name || '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  })
  // Si cambia el user y no está en modo alterno, refrescamos el titular visible
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
    if (digits.length < 13 || digits.length > 19) {
      e.cardNumber = 'Debe contener entre 13 y 19 dígitos.'
    } else if (!luhnCheck(digits)) {
      e.cardNumber = 'Tarjeta inválida.'
    }
    if (!isValidExpiry(payForm.expiry)) e.expiry = 'Caducidad inválida (MM/AA).'
    if (!isValidCVC(digitsOnly(payForm.cvc), brand)) {
      e.cvc = brand === 'AMEX' ? 'CVC de 4 dígitos.' : 'CVC de 3 dígitos.'
    }
    setPayErrors(e)
    return Object.keys(e).length === 0
  }

  // Si no hay orden (refresh directo), pantalla genérica
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

  // Datos resumen
  const items = Array.isArray(order.items) ? order.items : []
  const isMultiple = items.length > 1

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

  const deliveryPhrase = isMultiple
    ? `Sus ejemplares llegarán ${estimatedWindow}`
    : `Su ejemplar llegará ${estimatedWindow}`

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

      {/* B1 & B2 */}
      <GridTwo>
        {/* Envío */}
        <Card>
          <H2>Información de envío</H2>
          <Row>
            <input
              id='other-address'
              type='checkbox'
              checked={useAltShipping}
              onChange={(e) => setUseAltShipping(e.target.checked)}
            />
            <label htmlFor='other-address'>Usar otra dirección</label>
          </Row>

          {!useAltShipping ? (
            <>
              <SummaryRow>
                <div>Nombre:</div>
                <div>{shipForm.fullName || user?.name || '—'}</div>
              </SummaryRow>
              <SummaryRow>
                <div>Dirección:</div>
                <div>
                  {shipForm.address}
                  {shipForm.address && ', '}
                  {shipForm.city}
                  {shipForm.city && ', '}
                  {shipForm.postalCode}
                  {shipForm.postalCode && ', '}
                  {shipForm.country}
                </div>
              </SummaryRow>
              <SmallNote>
                Origen: tu perfil/orden. Marca “Usar otra dirección” para
                cambiarla sólo aquí.
              </SmallNote>
            </>
          ) : (
            <>
              <Field>
                <Label>Nombre completo</Label>
                <Input
                  value={shipForm.fullName}
                  onChange={(e) =>
                    setShipForm((f) => ({ ...f, fullName: e.target.value }))
                  }
                />
                {shipErrors.fullName && (
                  <ErrorText>{shipErrors.fullName}</ErrorText>
                )}
              </Field>
              <Field>
                <Label>Dirección</Label>
                <Input
                  value={shipForm.address}
                  onChange={(e) =>
                    setShipForm((f) => ({ ...f, address: e.target.value }))
                  }
                />
                {shipErrors.address && (
                  <ErrorText>{shipErrors.address}</ErrorText>
                )}
              </Field>
              <Field>
                <Label>Ciudad</Label>
                <Input
                  value={shipForm.city}
                  onChange={(e) =>
                    setShipForm((f) => ({ ...f, city: e.target.value }))
                  }
                />
                {shipErrors.city && <ErrorText>{shipErrors.city}</ErrorText>}
              </Field>
              <Field>
                <Label>Código postal</Label>
                <Input
                  value={shipForm.postalCode}
                  onChange={(e) =>
                    setShipForm((f) => ({ ...f, postalCode: e.target.value }))
                  }
                />
                {shipErrors.postalCode && (
                  <ErrorText>{shipErrors.postalCode}</ErrorText>
                )}
              </Field>
              <Field>
                <Label>País</Label>
                <Input
                  value={shipForm.country}
                  onChange={(e) =>
                    setShipForm((f) => ({ ...f, country: e.target.value }))
                  }
                />
                {shipErrors.country && (
                  <ErrorText>{shipErrors.country}</ErrorText>
                )}
              </Field>
              <SmallNote>
                Estos cambios no actualizan tu perfil ni la orden almacenada.
              </SmallNote>
            </>
          )}
        </Card>

        {/* Pago */}
        <Card>
          <H2>Información de pago</H2>
          <Row>
            <input
              id='other-pay'
              type='checkbox'
              checked={useAltPayment}
              onChange={(e) => setUseAltPayment(e.target.checked)}
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
                Origen: tu perfil. Marca “Usar otros datos de pago” para
                introducir otra tarjeta.
              </SmallNote>
            </>
          ) : (
            <>
              <Field>
                <Label>Nombre titular</Label>
                <Input
                  value={payForm.holderName}
                  onChange={(e) =>
                    setPayForm((f) => ({ ...f, holderName: e.target.value }))
                  }
                />
                {payErrors.holderName && (
                  <ErrorText>{payErrors.holderName}</ErrorText>
                )}
              </Field>
              <Field>
                <Label>Número de tarjeta</Label>
                <Input
                  placeholder='1234 5678 9012 3456'
                  value={payForm.cardNumber}
                  inputMode='numeric'
                  onChange={(e) =>
                    setPayForm((f) => ({
                      ...f,
                      cardNumber: formatCardNumber(e.target.value)
                    }))
                  }
                  onPaste={(e) => {
                    const text = (
                      e.clipboardData || window.clipboardData
                    ).getData('text')
                    e.preventDefault()
                    setPayForm((f) => ({
                      ...f,
                      cardNumber: formatCardNumber(text)
                    }))
                  }}
                />
                {payErrors.cardNumber && (
                  <ErrorText>{payErrors.cardNumber}</ErrorText>
                )}
              </Field>
              <Field>
                <Label>Caducidad (MM/AA)</Label>
                <Input
                  placeholder='MM/AA'
                  value={payForm.expiry}
                  inputMode='numeric'
                  onChange={(e) =>
                    setPayForm((f) => ({
                      ...f,
                      expiry: formatExpiry(e.target.value)
                    }))
                  }
                />
                {payErrors.expiry && <ErrorText>{payErrors.expiry}</ErrorText>}
              </Field>
              <Field>
                <Label>CVC</Label>
                <Input
                  placeholder={
                    detectBrand(digitsOnly(payForm.cardNumber)) === 'AMEX'
                      ? '****'
                      : '***'
                  }
                  value={payForm.cvc}
                  inputMode='numeric'
                  onChange={(e) =>
                    setPayForm((f) => ({
                      ...f,
                      cvc: digitsOnly(e.target.value).slice(
                        0,
                        detectBrand(digitsOnly(payForm.cardNumber)) === 'AMEX'
                          ? 4
                          : 3
                      )
                    }))
                  }
                />
                {payErrors.cvc && <ErrorText>{payErrors.cvc}</ErrorText>}
              </Field>
              <SmallNote>Estos datos no se guardan en tu perfil.</SmallNote>
            </>
          )}
        </Card>
      </GridTwo>

      {/* Revisión y envío (nuevo layout) */}
      <Card>
        <H2>Revisión y envío</H2>

        {/* Datos de envío y pago lado a lado */}
        <DetailsGrid>
          <DetailsCard>
            <h3 style={{ marginBottom: 8 }}>Datos de envío</h3>
            <LV>
              <b>Nombre:</b>
              <div>{shipForm.fullName || user?.name || '—'}</div>
            </LV>
            <LV>
              <b>Dirección:</b>
              <div>{shipForm.address || '—'}</div>
            </LV>
            <LV>
              <b>Ciudad:</b>
              <div>{shipForm.city || '—'}</div>
            </LV>
            <LV>
              <b>Código postal:</b>
              <div>{shipForm.postalCode || '—'}</div>
            </LV>
            <LV>
              <b>País:</b>
              <div>{shipForm.country || '—'}</div>
            </LV>
          </DetailsCard>

          <DetailsCard>
            <h3 style={{ marginBottom: 8 }}>Pago</h3>
            <LV>
              <b>Titular:</b>
              <div>
                {useAltPayment
                  ? payForm.holderName || '—'
                  : user?.payment?.cardHolderName || user?.name || '—'}
              </div>
            </LV>
            <LV>
              <b>Tarjeta:</b>
              <div>
                {useAltPayment
                  ? digitsOnly(payForm.cardNumber).slice(-4)
                    ? `•••• •••• •••• ${digitsOnly(payForm.cardNumber).slice(
                        -4
                      )}`
                    : '—'
                  : maskLast4(user?.payment?.last4)}
              </div>
            </LV>
            <LV>
              <b>Caducidad:</b>
              <div>
                {useAltPayment
                  ? payForm.expiry || '—'
                  : user?.payment?.expiry || '—'}
              </div>
            </LV>
            <LV>
              <b>Método de pago:</b>
              <div>{order.paymentMethod || 'Tarjeta'}</div>
            </LV>
          </DetailsCard>
        </DetailsGrid>

        {/* Entrega a todo el ancho */}
        <Section style={{ marginTop: 16 }}>
          <h3>Entrega</h3>
          <div style={{ marginTop: 4 }}>{shippingLabel}</div>
          <p style={{ marginTop: 6 }}>{deliveryPhrase}</p>
        </Section>

        <Divider />

        {/* Resumen del pedido con “Contenido adquirido / Cantidad” + totales */}
        <Section>
          <h3>Resumen del pedido</h3>

          {items.map((it, idx) => (
            <div key={idx} style={{ marginTop: 8, marginBottom: 6 }}>
              {/* <div style={{ fontSize: '0.95rem' }}>
                <b>Contenido adquirido:</b> {itemTitle(it.title)}
              </div> */}
              {/* <ItemRow>
                <div>
                  <b>Cantidad:</b> {it.quantity}
                </div>
                <div>{(it.price * it.quantity).toFixed(2)} €</div>
              </ItemRow> */}
            </div>
          ))}

          {(() => {
            const subtotal = items.reduce(
              (s, it) => s + it.price * it.quantity,
              0
            )
            const shippingCost = Number(shippingOption?.extra || 0)
            return (
              <>
                <Divider />
                <ItemRow>
                  <div>Subtotal</div>
                  <div>{subtotal.toFixed(2)} €</div>
                </ItemRow>
                <ItemRow>
                  <div>Envío</div>
                  <div>{shippingCost.toFixed(2)} €</div>
                </ItemRow>
                <ItemRow style={{ fontWeight: 700 }}>
                  <div>Total</div>
                  <div>{(subtotal + shippingCost).toFixed(2)} €</div>
                </ItemRow>
              </>
            )
          })()}
        </Section>

        <Link to='/' style={{ display: 'inline-block', marginTop: 8 }}>
          Volver al inicio
        </Link>
      </Card>
    </Container>
  )
}
