import React from 'react'
import styled from 'styled-components'

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1600;
  display: grid;
  place-items: center;
`
const Panel = styled.div`
  width: min(720px, 92vw);
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  overflow: hidden;
`
const Head = styled.div`
  padding: 14px 16px;
  font-weight: 700;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`
const Body = styled.div`
  padding: 16px;
`
const Foot = styled.div`
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`
/** 
Modal controlado:
open: boolean, render con condicion
title: string 
 footer con acciones
 onClose: cierra al click en backdrop
 */

export default function Modal({ open, title, children, footer, onClose }) {
  if (!open) return null
  return (
    <Backdrop onClick={onClose}>
      <Panel onClick={(e) => e.stopPropagation()}>
        {title && <Head>{title}</Head>}
        <Body>{children}</Body>
        <Foot>{footer}</Foot>
      </Panel>
    </Backdrop>
  )
}
