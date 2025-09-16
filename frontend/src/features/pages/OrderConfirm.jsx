// frontend/src/features/Checkout/OrderConfirmPage.jsx
import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import styled from 'styled-components'
import { addBusinessDays, format } from 'date-fns'
import useAuth from '../../hooks/useAuth'

const Container = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
`

const Title = styled.h1`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
`

const Bold = styled.span`
  font-weight: bold;
`

export default function OrderConfirm() {
  const { user } = useAuth()
  const { state } = useLocation()

  // Orden REAL del backend y la opción seleccionada que envía el checkout
  const order = state?.order || null
  const shippingOption = state?.shippingOption || null

  // Si no tenemos la orden (recarga o acceso directo), mostramos confirmación genérica
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
            <Link to='/mis-libros'>Ver mis libros</Link>
            <Link to='/'>Volver al inicio</Link>
          </div>
        </Card>
      </Container>
    )
  }

  // Campos del backend
  const shipping = order.shippingAddress || {}
  const shippingName = shipping.fullName || user?.name || 'lector/a'
  const items = Array.isArray(order.items) ? order.items : []
  const isMultiple = items.length > 1

  // Envío (si no llega la opción, asumimos estándar para el texto)
  const shippingKey = shippingOption?.key || 'standard'
  const shippingLabel =
    shippingOption?.label ||
    (shippingKey === 'fast'
      ? 'Entrega rápida (2 días laborables)'
      : 'Entrega estándar (5-6 días laborables)')

  // Estimación de fecha (simple)
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

  const total =
    typeof order.totalPrice === 'number'
      ? order.totalPrice.toFixed(2)
      : order.totalPrice

  return (
    <Container>
      <Title>Gracias por su compra, {shippingName}!</Title>
      <Card>
        <Section>
          <h2>Resumen</h2>

          {(shipping.fullName || shipping.address) && (
            <>
              <SummaryRow>
                <div>Nombre:</div>
                <div>{shipping.fullName || shippingName}</div>
              </SummaryRow>
              <SummaryRow>
                <div>Dirección:</div>
                <div>
                  {shipping.address}
                  {shipping.address && ', '}
                  {shipping.city}
                  {shipping.city && ', '}
                  {shipping.postalCode}
                  {shipping.postalCode && ', '}
                  {shipping.country}
                </div>
              </SummaryRow>
            </>
          )}

          <SummaryRow>
            <div>Método de pago:</div>
            <div>{order.paymentMethod || 'Tarjeta'}</div>
          </SummaryRow>

          <SummaryRow>
            <div>Envío:</div>
            <div>{shippingLabel}</div>
          </SummaryRow>

          {/* Lista muy simple de items */}
          {items.map((it, idx) => (
            <SummaryRow key={idx}>
              <div>
                {it.quantity} x {it.label || it.format}
              </div>
              <div>{(it.price * it.quantity).toFixed(2)} €</div>
            </SummaryRow>
          ))}

          <SummaryRow>
            <Bold>Total:</Bold>
            <Bold>{total} €</Bold>
          </SummaryRow>
        </Section>

        <Section>
          <h3>{deliveryPhrase}</h3>
          <p>
            {isMultiple
              ? 'Gracias por confiar en KbooK Store. Puedes seguir comprando más títulos si lo deseas.'
              : 'Gracias por confiar en KbooK Store. Esperamos que disfrute su lectura.'}
          </p>
        </Section>

        <Link to='/'>Volver al inicio</Link>
      </Card>
    </Container>
  )
}
