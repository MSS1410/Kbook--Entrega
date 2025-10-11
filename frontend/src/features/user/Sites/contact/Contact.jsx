import React, { useState } from 'react'
import styled from 'styled-components'
import { sendContactMessage } from '../../../../api/contact'
import useAuth from '../../../../hooks/useAuth'

// briing em here
import ContactHeader from './contactComponents/ContactHeader'
import ContactForm from './contactComponents/ContactForm'
import InfoSection from './contactComponents/InfoSection'

// =layout
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

//  Contenido Info (img/textos)
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
// muestra CTA para abrir formulario
export default function ContactPage() {
  const { token } = useAuth() // session check

  // Toggle mnsjs
  const [open, setOpen] = useState(false) //abrir formulario

  // Form state
  const [subject, setSubject] = useState('') //campos formulario
  const [body, setBody] = useState('') // campos form
  const [sending, setSending] = useState(false) // disable sending durante Post
  const [sentOk, setSentOk] = useState(false) // muestra mensaje enviado
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    // valida que hay texto
    e.preventDefault()
    setError('')
    setSentOk(false)
    if (!subject.trim() && !body.trim()) {
      setError('Escribe asunto o mensaje.')
      return
    }
    try {
      // llama a sendContactMessage
      setSending(true)
      await sendContactMessage({ subject, body })
      setSubject('')
      setBody('')
      setSentOk(true)
      //limpia form i marca senOk
    } catch (e) {
      console.error(e)
      setError(e?.response?.data?.message || 'No se pudo enviar el mensaje')
    } finally {
      setSending(false)
    }
  }

  return (
    <Page>
      {/* titulo boton form */}
      <ContactHeader open={open} onToggle={() => setOpen((v) => !v)} />

      {/* Formulario modo modal */}
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

      {/*  tarj informativas texto img */}
      <InfoSection items={INFO} />
    </Page>
  )
}
