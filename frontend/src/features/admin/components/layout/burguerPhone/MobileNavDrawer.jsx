import React, { useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { Link, useLocation } from 'react-router-dom'

const fadeIn = keyframes`
  from { opacity: 0 }
  to { opacity: 1 }
`

const BarWrap = styled.div`
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 1100; /* por encima del header */
  display: ${({ open }) => (open ? 'block' : 'none')};
  animation: ${fadeIn} 160ms ease;
`

const Bar = styled.div`
  /* misma altura que el header por breakpoints */
  height: 56px;
  @media (min-width: 768px) {
    height: 60px;
  }
  @media (min-width: 1024px) {
    height: 64px;
  }

  background: ${({ theme }) =>
    theme.colors?.headerBg || 'rgba(255,255,255,0.85)'};
  color: ${({ theme }) => theme.colors?.headerText || '#111'};
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#eee'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); /* seapara soft */
  backdrop-filter: blur(6px);

  display: flex;
  align-items: center;
  padding: 0 8px;
  @media (min-width: 768px) {
    padding: 0 12px;
  }
  @media (min-width: 1024px) {
    padding: 0 16px;
  }
`

const Row = styled.nav`
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  width: 100%;
  /* chipy content visual */
  justify-content: center;
  padding-bottom: 2px; /* evita que el scrollbar tape los chips en iOS */
`

const Chip = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0px;
  padding: 6px 8px;
  border-radius: 9999px; // ← pills
  text-decoration: none;
  color: ${({ theme }) => theme.colors?.headerText || '#111'};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#eee'};
  background: ${({ theme }) => theme.colors?.bg || '#fff'};
  font-weight: 600;
  white-space: nowrap;
  font-size: 12px;

  &:hover {
    background: ${({ theme }) => theme.colors?.mutedSurface || '#f3f4f6'};
  }

  @media (min-width: 768px) {
    padding: 7px 10px;
    font-size: 13px;
  }

  @media (min-width: 1024px) {
    padding: 8px 10px;
    font-size: 13px;
  }
`

const CloseBtn = styled.button`
  border: 0;
  background: transparent;
  border-radius: 9999px;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors?.headerText || '#111'};
  flex: 0 0 auto;
  margin-left: 6px;

  &:hover {
    background: ${({ theme }) => theme.colors?.mutedSurface || '#f3f4f6'};
  }

  @media (max-width: 360px) {
    display: none; /* en móviles muy estrechos, cerramos tocando un chip */
  }
`

/* capa invisible para click fuera, no funciona */
const ClickOutside = styled.button`
  position: fixed;
  left: 0;
  right: 0;
  /* ocupa TODO lo que NO es el header: desde el borde inferior de la barra hacia abajo */
  top: 56px; /* debe coincidir con la altura del header/bar */
  bottom: 0;
  z-index: 1000; /* por debajo de la barra (1100) pero por encima del contenido */
  background: transparent;
  border: 0;
  padding: 0;
  margin: 0;
  display: ${({ open }) => (open ? 'block' : 'none')};
  cursor: default;

  @media (min-width: 768px) {
    top: 60px;
  } /* iPad */
  @media (min-width: 1024px) {
    top: 64px;
  } /* desktop */
`

export default function MobileNavDrawer({ open, onClose, items }) {
  const location = useLocation()
  const barRef = useRef(null)
  const [closing, setClosing] = useState(false)

  // cierro nav para camvio de ruta
  useEffect(() => {
    if (!open) return
    onClose?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // Cerrar con ESC
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // click fuera  menu
  // usamos un overlay invisible capturo click capa invisible
  const handleClose = () => {
    // animacion de salida y luego cierre real
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      onClose?.()
    }, 140)
  }

  return (
    <>
      <BarWrap open={open} aria-hidden={!open}>
        <Bar ref={barRef} role='dialog' aria-modal='false'>
          <Row>
            {items.map((it) => (
              <Chip key={it.to} to={it.to} onClick={handleClose}>
                <span>{it.label}</span>
              </Chip>
            ))}
          </Row>

          <CloseBtn aria-label='Cerrar' onClick={handleClose} title='Cerrar'>
            <svg width='16' height='16' viewBox='0 0 24 24' aria-hidden='true'>
              <path
                d='M6 6l12 12M18 6L6 18'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
              />
            </svg>
          </CloseBtn>
        </Bar>
      </BarWrap>

      {/* click fuera cierra*/}
      <ClickOutside open={open} onClick={handleClose} aria-hidden={!open} />
    </>
  )
}
