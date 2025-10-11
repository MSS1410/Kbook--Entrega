import React from 'react'
import styled from 'styled-components'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: grid;
  place-items: center;
  z-index: 50;
`
const Box = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  width: min(640px, 92vw);
  border: 1px solid #eee;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
`

export default function Modal({ open, onClose, children }) {
  if (!open) return null
  {
    /* facil, no render sino abierto */
  }
  return (
    <Overlay onClick={onClose}>
      {/* OutClick -> cierre modal */}
      <Box onClick={(e) => e.stopPropagation()}>{children}</Box>
      {/*stop..- evita cierre accidental  */}
    </Overlay>
  )
}
