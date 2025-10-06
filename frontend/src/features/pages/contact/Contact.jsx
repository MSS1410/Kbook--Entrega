import React, { useState } from 'react'
import styled from 'styled-components'
import { sendContactMessage } from '../../../api/contact'
import { Link } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'

// ======= UI base =======

const Page = styled.section`
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 20px 64px;
  display: grid;
  gap: 28px;
`

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`

const Title = styled.h1`
  font-size: clamp(24px, 2.4vw, 36px);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
  color: ${({ theme }) => theme.colors?.primary || '#8b5cf6'};
`

const Lead = styled.p`
  margin: 8px 0 0 0;
  color: ${({ theme }) => theme.colors?.mutedText || '#5b5b5b'};
  max-width: 65ch;
`

const SectionSplit = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors?.border || '#eee'};
  margin: 8px 0 8px;
`

const ToggleBtn = styled.button`
  appearance: none;
  border: 1px solid ${({ theme }) => theme.colors?.primary || '#8b5cf6'};
  background: ${({ theme }) => theme.colors?.primary || '#8b5cf6'};
  color: #fff;
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.05s ease, opacity 0.2s ease,
    background-color 0.2s ease;
  &:hover {
    opacity: 0.95;
  }
  &:active {
    transform: translateY(1px);
  }
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

// ======= Caja formulario =======

const SectionBox = styled.section`
  border: 1px solid ${({ theme }) => theme.colors?.border || '#eee'};
  background: ${({ theme }) => theme.colors?.cardBg || '#fff'};
  border-radius: ${({ theme }) => theme.radii?.lg || '16px'};
  padding: 16px;
  display: grid;
  gap: 12px;
`

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#ddd'};
  background: #fff;
  border-radius: 10px;
  width: 100%;
`

const Textarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#ddd'};
  background: #fff;
  border-radius: 10px;
  width: 100%;
`

const Button = styled.button`
  padding: 10px 14px;
  background: ${({ theme }) => theme.colors?.primary || '#8b5cf6'};
  color: #fff;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const Muted = styled.p`
  color: ${({ theme }) => theme.colors?.mutedText || '#666'};
  margin: 0;
`

// ======= Sección de información =======

// ★ Card con columnas dinámicas: cuando la imagen va a la izquierda ($flip),
//   le damos MENOS ancho a la imagen (0.7fr) y MÁS al texto (1.3fr), para que
//   el texto empiece antes y no se “amontone” a la derecha.
const Card = styled.article`
  display: grid;
  grid-template-columns: ${(props) =>
    props.$flip ? '0.7fr 1.3fr' : '1.3fr 0.7fr'}; /* ★ */
  align-items: center;
  gap: 18px;
  padding: 20px;
  border-radius: ${({ theme }) => theme.radii?.lg || '16px'};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#efefef'};
  background: ${({ theme }) => theme.colors?.cardBg || '#fff'};
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.04);

  @media (max-width: 900px) {
    grid-template-columns: 1fr; /* en móvil se apila */
  }
`

const CardText = styled.div``

const CardTitle = styled.h2`
  margin: 0 0 6px 0;
  font-size: 20px;
  color: ${({ theme }) =>
    theme.colors?.primary || '#8b5cf6'}; /* títulos lilas */
`

const CardDesc = styled.p`
  margin: 0;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors?.mutedText || '#555'};
`

// ★ Contenedor visual de la imagen con tamaño uniforme
const Art = styled.div`
  /* mismo tamaño para todas las imágenes */
  --imgSize: clamp(120px, 22vw, 220px);
  width: var(--imgSize);
  height: var(--imgSize);
  border-radius: 14px;
  overflow: hidden;
  background: #f8f8ff;
  box-shadow: 0 1px 12px rgba(0, 0, 0, 0.06);
  justify-self: center; /* centramos por defecto */

  /* cuando la imagen va a la izquierda, que “tire” hacia el texto */
  ${(props) =>
    props.$left &&
    `
    justify-self: start;          /* se pega más al texto */
  `}

  /* en móvil, que no se quede gigante */
  @media (max-width: 900px) {
    width: clamp(120px, 40vw, 200px);
    height: clamp(120px, 40vw, 200px);
  }
`

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain; /* respeta proporción, no recorta */
  display: block;
`

const InfoGrid = styled.div`
  display: grid;
  gap: 18px;
`

// ======= Datos de las subsecciones =======
// Puedes colocar tus imágenes en public/assets/contact/* y usar rutas absolutas
//   p.ej. '/assets/contact/kbook.png' (Vite las sirve tal cual).
// Alternativa si prefieres src/assets: new URL('../../../assets/...', import.meta.url).href
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

// ======= Página =======

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
      {/* Cabecera */}
      <Header>
        <div>
          <Title>Contacto</Title>
          <Lead>
            ¿Tienes dudas, propuestas o quieres saludar? Aquí tienes un canal
            directo con el equipo y más información sobre el proyecto.
          </Lead>
        </div>
        <ToggleBtn onClick={() => setOpen((v) => !v)}>
          {open ? 'Ocultar formulario' : 'Contacte con Nosotros'}
        </ToggleBtn>
      </Header>

      {/* Mensajería primero (colapsable) */}
      <Collapse open={open}>
        <CollapseInner>
          <SectionBox>
            {!token ? (
              <>
                <h2 style={{ margin: 0, color: 'inherit' }}>Escríbenos</h2>
                <Muted>
                  Debes estar identificado para enviar un mensaje.{' '}
                  <Link to='/login'>Inicia sesión</Link> o{' '}
                  <Link to='/register'>crea tu cuenta</Link>.
                </Muted>
              </>
            ) : (
              <>
                <h2 style={{ margin: 0, color: 'inherit' }}>Escríbenos</h2>
                <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
                  <label>
                    <div>Asunto</div>
                    <Input
                      placeholder='Cuéntanos brevemente el motivo…'
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </label>
                  <label>
                    <div>Mensaje</div>
                    <Textarea
                      rows={5}
                      placeholder='Escribe tu mensaje para el equipo de KBOOK…'
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                    />
                  </label>
                  <div
                    style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                  >
                    <Button type='submit' disabled={sending}>
                      {sending ? 'Enviando…' : 'Enviar mensaje'}
                    </Button>
                    {sentOk && (
                      <span style={{ color: '#16a34a' }}>
                        ¡Mensaje enviado!
                      </span>
                    )}
                    {error && <span style={{ color: '#dc2626' }}>{error}</span>}
                  </div>
                </form>
                <Muted style={{ fontSize: 12 }}>
                  Responderemos lo antes posible. Si tu consulta está vinculada
                  a un pedido, por favor incluye el número de pedido.
                </Muted>
              </>
            )}
          </SectionBox>
        </CollapseInner>
      </Collapse>

      <SectionSplit />

      {/* Sección de Información (4 subsecciones) con alternancia */}
      <InfoGrid>
        {INFO.map((item, idx) => {
          const flip = idx % 2 === 1 // imagen a la izquierda en filas impares
          return (
            <Card key={item.title} $flip={flip}>
              {/* cuando flip=true, la imagen va primera */}
              <CardText style={{ order: flip ? 2 : 1 }}>
                <CardTitle>{item.title}</CardTitle>
                <CardDesc>{item.desc}</CardDesc>
              </CardText>

              <Art $left={flip} style={{ order: flip ? 1 : 2 }}>
                {/* Si prefieres src/assets en lugar de public/assets:
                   const url = new URL('../../../assets/contact/kbook.png', import.meta.url).href
                   y pones item.img = url */}
                <Img
                  src={item.img}
                  alt={item.alt || item.title}
                  loading='lazy'
                />
              </Art>
            </Card>
          )
        })}
      </InfoGrid>
    </Page>
  )
}
