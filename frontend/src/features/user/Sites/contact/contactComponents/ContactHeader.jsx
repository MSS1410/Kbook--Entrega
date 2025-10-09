// components/ContactHeader.jsx
import React from 'react'
import styled from 'styled-components'

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

export default function ContactHeader({ open, onToggle }) {
  return (
    <Header>
      <div>
        <Title>Contacto</Title>
        <Lead>
          ¿Tienes dudas, propuestas o quieres saludar? Aquí tienes un canal
          directo con el equipo y más información sobre el proyecto.
        </Lead>
      </div>
      <ToggleBtn onClick={onToggle}>
        {open ? 'Ocultar formulario' : 'Contacte con Nosotros'}
      </ToggleBtn>
    </Header>
  )
}
