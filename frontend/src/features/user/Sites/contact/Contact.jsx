// Contact.jsx
import React, { useState } from 'react'
import styled from 'styled-components'
import { sendContactMessage } from '../../../../api/contact'
import useAuth from '../../../../hooks/useAuth'

// Presentacionales
import ContactHeader from './contactComponents/ContactHeader'
import ContactForm from './contactComponents/ContactForm'
import InfoSection from './contactComponents/InfoSection'

// ======= UI base mínima (layout/collapse) =======
const Page = styled.section`
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 20px 64px;
  display: grid;
  gap: 28px;
`
const SectionSplit = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors?.border || '#eee'};
  margin: 8px 0 8px;
`
const Collapse = styled.div`
  overflow: clip;
  transition: grid-template-rows 0.28s ease, opacity 0.28s ease;
  display: grid;
  grid-template-rows: ${(props) => (props.open ? '1fr' : '0fr')};
  opacity: ${(props) => (props.open ? 1 : 0.6)};
`
const CollapseInner = styled.div`
  min-height: 0;
`

// ======= Contenido Info (imágenes/textos) =======
const INFO = [
  {
    title: '¿Qué es Kbook?',
    desc: 'Kbook es un portal para descubrir, gestionar y disfrutar de libros. Un catálogo vivo donde explorar títulos, autores y reseñas de la comunidad.',
    img: '/src/assets/images/contact/ContactLector.jpeg',
    alt: 'Ilustración libro'
  },
  {
    title: '¿Quién somos?',
    desc: 'Somos lectores entusiastas del papel y defensores de la lectura. Nacemos con la idea de ayudar a preservar el hábito lector y facilitar el acceso a obras y autores.',
    img: '/src/assets/images/contact/contactoQUIEN.jpg',
    alt: 'Persona leyendo'
  },
  {
    title: 'Comunidad',
    desc: 'Kbook acoge a más de 150 usuarios. Tomamos en serio cada opinión: vuestras reseñas y sugerencias nos ayudan a mejorar cada día.',
    img: '/src/assets/images/contact/contactoComuni.jpg',
    alt: 'Comunidad de lectores'
  },
  {
    title: 'Publicaciones',
    desc: 'Kbook se actualiza a diario incorporando nuevos ejemplares y autores para ponerlos a disposición del lector.',
    img: '/src/assets/images/contact/contactPublis.jpg',
    alt: 'Nuevas publicaciones'
  }
]

export default function ContactPage() {
  const { token } = useAuth()

  // Toggle mensajería
  const [open, setOpen] = useState(false)

  // Form state
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sentOk, setSentOk] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSentOk(false)
    if (!subject.trim() && !body.trim()) {
      setError('Escribe asunto o mensaje.')
      return
    }
    try {
      setSending(true)
      await sendContactMessage({ subject, body })
      setSubject('')
      setBody('')
      setSentOk(true)
    } catch (e) {
      console.error(e)
      setError(e?.response?.data?.message || 'No se pudo enviar el mensaje')
    } finally {
      setSending(false)
    }
  }

  return (
    <Page>
      <ContactHeader open={open} onToggle={() => setOpen((v) => !v)} />

      {/* Formulario colapsable */}
      <Collapse open={open}>
        <CollapseInner>
          <ContactForm
            token={token}
            subject={subject}
            onSubject={setSubject}
            body={body}
            onBody={setBody}
            sending={sending}
            sentOk={sentOk}
            error={error}
            onSubmit={onSubmit}
          />
        </CollapseInner>
      </Collapse>

      <SectionSplit />

      {/* Sección informativa */}
      <InfoSection items={INFO} />
    </Page>
  )
}
