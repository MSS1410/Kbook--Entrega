// components/ReviewAndTotals.jsx
import React from 'react'
import styled from 'styled-components'

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
`
const H2 = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`
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
  grid-template-columns: auto 1fr; /* Label + Valor */
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
const Section = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
`
const Divider = styled.hr`
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing.md} 0;
`
const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto; /* Descripción y precio */
  align-items: baseline;
  gap: 12px;
  margin-bottom: 6px;
`

export default function ReviewAndTotals({
  shipForm, // direccion final mostrada
  useAltPayment, // decido que muestro en pago
  payForm, // datos en editables
  user, // datos perfil
  order, // metodo de pago
  shippingLabel, // opcion elegida
  deliveryPhrase, // recibo frase
  subtotal,
  shippingCost,
  total
}) {
  return (
    <Card>
      <H2>Revisión y envío</H2>

      <DetailsGrid>
        <DetailsCard>
          <h3 style={{ marginBottom: 8 }}>Datos de envío</h3>
          <LV>
            <b>Nombre:</b>
            <div>{shipForm.fullName || user?.name || '—'}</div>
            {/* Prioriza form edicion local */}
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
                ? payForm.holderName || '—' // si hay editado leerlo
                : user?.payment?.cardHolderName || user?.name || '—'}{' '}
              {/* leer perfil sino hay editado */}
            </div>
          </LV>
          <LV>
            <b>Método:</b>
            {/* etiquet generada en checkout */}
            <div>{order.paymentMethod || 'Tarjeta'}</div>
          </LV>
          <LV>
            <b>Caducidad:</b>
            <div>
              {useAltPayment
                ? payForm.expiry || '—'
                : user?.payment?.expiry || '—'}
            </div>
          </LV>
        </DetailsCard>
      </DetailsGrid>

      <Section>
        <h3>Entrega</h3>
        <div style={{ marginTop: 4 }}>{shippingLabel}</div>
        <p style={{ marginTop: 6 }}>{deliveryPhrase}</p>
      </Section>

      <Divider />

      <Section>
        <h3>Resumen del pedido</h3>
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
          <div>{total.toFixed(2)} €</div>
        </ItemRow>
      </Section>
    </Card>
  )
}
