import React from 'react'
import styled from 'styled-components'

const SectionWrap = styled.section`
  display: grid;
  gap: 12px;
`
const SectionHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`
const Title = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.01em;
`
const Subtitle = styled.p`
  margin-top: 2px;
  font-size: 0.875rem;
  color: #64748b;
`

/**
-- Cabecera de section reusable: -- 
 - title, subtitle
- accion: buton o link a la derecha
- children: contenido seccion
 */
export default function Section({ title, subtitle, action, children }) {
  return (
    <SectionWrap>
      <SectionHeader>
        <div>
          <Title>{title}</Title>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </div>
        {action}
      </SectionHeader>
      {children}
    </SectionWrap>
  )
}
