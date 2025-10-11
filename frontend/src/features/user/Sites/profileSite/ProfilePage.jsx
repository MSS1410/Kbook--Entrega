import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import PersonalSection from '../../../../components/profile/PersonalSection'
import ShippingSection from '../../../../components/profile/ShippingSection'
import PaymentSection from '../../../../components/profile/PaymentSection'
import BooksAccordion from '../../../../components/profile/MyBooks'
import MessagesAccordion from '../../../../components/profile/MessagesAcc'

const Container = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  padding: ${({ theme }) => theme.spacing.lg};
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
`
const GridTwo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

/* Aviso post-registro */
const Alert = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: start;
  background: ${({ theme }) => theme.colors.mutedSurface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onSurface};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
`
const Close = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
`
// pagina de perfil compuesta por, personal Section, shipping sect, payment sect

export default function ProfilePage() {
  const [expanded, setExpanded] = useState(null) // controla que acordeon esta abierto
  const [showOnboarding, setShowOnboarding] = useState(false) // se activa 1 vez, se borra la flag del sessionstrg

  useEffect(() => {
    try {
      if (sessionStorage.getItem('kbook:justRegistered') === '1') {
        setShowOnboarding(true)
        sessionStorage.removeItem('kbook:justRegistered')
      }
    } catch {}
  }, [])

  return (
    <Container>
      {showOnboarding && (
        <Alert role='status'>
          <div>
            <strong>¡Bienvenido/a a Kbook!</strong>
            <div style={{ marginTop: 6 }}>
              {/* alerta para completar informacion del perfil */}
              Te recomendamos completar tus datos de <b>envío</b> y <b>pago</b>{' '}
              antes de explorar la tienda para agilizar tus compras.
            </div>
          </div>
          <Close
            aria-label='Cerrar aviso'
            onClick={() => setShowOnboarding(false)}
          >
            ×
          </Close>
        </Alert>
      )}
      {/* secciones */}
      {/* seccion 1: Personal */}
      <PersonalSection />

      {/* seccion 2: Send & Pay */}
      <GridTwo>
        <ShippingSection />
        <PaymentSection />
      </GridTwo>

      {/* seccion 3: Mis Libros & Mensajes */}
      <GridTwo>
        <BooksAccordion
          open={expanded === 'books'}
          onToggle={() =>
            setExpanded((cur) => (cur === 'books' ? null : 'books'))
          }
        />
        <MessagesAccordion
          open={expanded === 'messages'}
          onToggle={() =>
            setExpanded((cur) => (cur === 'messages' ? null : 'messages'))
          }
        />
      </GridTwo>
    </Container>
  )
}
