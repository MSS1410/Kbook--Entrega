// components/ReviewStep.jsx
import React from 'react'
import styled from 'styled-components'
import { addBusinessDays, format } from 'date-fns'

const FormSection = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
`
const TopSummary = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr; /* Dos columnas: envío y pago */
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
  grid-template-columns: auto 1fr; /* Etiqueta + valor */
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
const ShippingSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid #ccc;
  width: 100%;
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
  aspect-ratio: 3/4;
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
  grid-template-columns: 1fr auto; // qty a la izq, precio a la dcha
  gap: 8px;
  align-items: baseline;
`
const SummaryBox = styled.div`
  background: #f9f9f9;
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};
`
const Note = styled.p`
  color: ${({ theme }) => theme.colors.mutedText}; // texto informativo
  font-size: 0.9rem;
  margin-top: 6px;
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

export default function ReviewStep({
  shippingDisplay, // objeto con {name, address, city, postalCode, country}
  paymentDisplay, // {holderName, last4, expiry}
  shippingOptions, // array de opciones para el envio
  selectedShippingOption,
  onChangeShippingOption, // setter de option (key)
  items, // cart items
  subtotal,
  shippingCost,
  total,
  submitError,
  submitting,
  onBack,
  onConfirm
}) {
  const baseDate = new Date() // Ahora
  const isFast = selectedShippingOption.key === 'fast' // si es envio rapido
  const windowTxt = isFast // condiciones de cada uno y consecuencias $$
    ? format(addBusinessDays(baseDate, 2), 'dd MMM yyyy')
    : `${format(addBusinessDays(baseDate, 5), 'dd MMM yyyy')} - ${format(
        addBusinessDays(baseDate, 6),
        'dd MMM yyyy'
      )}`

  return (
    <FormSection>
      <h2>3. Revisión y envío</h2>

      <TopSummary style={{ marginTop: 12 }}>
        <SummaryCard>
          <h3 style={{ marginBottom: 8 }}>Datos de envío</h3>
          {[
            ['Nombre', shippingDisplay.name],
            ['Dirección', shippingDisplay.address],
            ['Ciudad', shippingDisplay.city],
            ['Código postal', shippingDisplay.postalCode],
            ['País', shippingDisplay.country]
          ].map(([k, v]) => (
            <LV key={k}>
              <b>{k}:</b>
              <div>{v || '—'}</div>
              {/*  "-" si esta vacio */}
            </LV>
          ))}
        </SummaryCard>

        <SummaryCard>
          <h3 style={{ marginBottom: 8 }}>Pago y envío</h3>
          <LV>
            <b>Titular:</b>
            <div>{paymentDisplay.holderName || '—'}</div>
            {/* titular */}
          </LV>
          <LV>
            <b>Tarjeta:</b>
            <div>
              {paymentDisplay.last4
                ? // mask  last 4 o -
                  `•••• •••• •••• ${paymentDisplay.last4}`
                : '—'}
            </div>
          </LV>
          <LV>
            <b>Caducidad:</b>
            <div>{paymentDisplay.expiry || '—'}</div>
          </LV>

          <div style={{ marginTop: 10 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>
              Opción de envío
            </label>

            <ShippingSelect
              // key actual st o fast
              value={selectedShippingOption.key}
              onChange={(e) => onChangeShippingOption(e.target.value)}
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

      {/* cart items */}
      <div style={{ marginTop: 24 }}>
        <h3>Ejemplares adquiridos</h3>

        <ItemsGrid style={{ marginTop: 12 }}>
          {items.map((it, idx) => {
            const b = it?.book

            const bid =
              (b && (b._id || b.id)) /* id del libro si existe objeto */ ||
              (typeof b === 'string' ? b : null) /* o si vino como string */ ||
              `idx-${idx}`

            const key = `${bid}-${it?.format || 'n/a'}-${idx}` /* key estable */

            const title =
              (b &&
                typeof b === 'object' &&
                (b.title || b.name)) /* misma metodol. */ ||
              it?.title ||
              'Libro'

            const cover =
              (b &&
                typeof b === 'object' &&
                b.coverImage) /* aseguramos cover  */ ||
              it?.coverImage ||
              ''
            const qty = Number(it?.quantity || 0) /* cantidad final */

            const priceNum = Number(it?.price || 0) * qty

            const price = Number.isFinite(priceNum)
              ? priceNum.toFixed(2)
              : '0.00' /* precio final */

            return (
              <ItemCard key={key}>
                <Cover>
                  {cover ? (
                    <img src={cover} alt={`Portada de ${title}`} />
                  ) : null}
                </Cover>

                <ItemTitle>{title}</ItemTitle>

                <PriceRow>
                  <div>Cantidad: {qty}</div> {/* total por línea */}
                  <div>{price} €</div>
                </PriceRow>
              </ItemCard>
            )
          })}
        </ItemsGrid>

        <SummaryBox>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}
          >
            <div>Subtotal</div>
            <div>{subtotal.toFixed(2)} €</div>
            {/* suma items */}
            <div>Envío</div>
            <div>{shippingCost.toFixed(2)} €</div>
            {/* coste opcion envio */}
            <div style={{ fontWeight: 700 }}>Total</div>
            <div style={{ fontWeight: 700 }}>{total.toFixed(2)} €</div>
          </div>
        </SummaryBox>
      </div>

      {/* ventana aprox de entrega */}
      <div style={{ marginTop: 24 }}>
        <h3>
          Su{items.length > 1 ? 's' : ''} ejemplar{items.length > 1 ? 'es' : ''}{' '}
          llegará{items.length > 1 ? 'n' : ''}…
          {/* tener en cuenta plural, singular */}
        </h3>

        <p style={{ marginTop: 6 }}>{windowTxt}</p>

        {/* fecha o rango estimado */}
        <Note>¡Gracias por su compra! En Kbook apreciamos su confianza.</Note>
      </div>

      {submitError && (
        <div style={{ color: 'red', marginTop: 12 }}>{submitError}</div>
      )}

      <ButtonRow>
        <SecondaryButton onClick={onBack} disabled={submitting}>
          Atrás
        </SecondaryButton>

        <PrimaryButton onClick={onConfirm} disabled={submitting}>
          {/* confirma compra */}
          {submitting ? 'Procesando…' : 'Finalizar compra'}
        </PrimaryButton>
      </ButtonRow>
    </FormSection>
  )
}
