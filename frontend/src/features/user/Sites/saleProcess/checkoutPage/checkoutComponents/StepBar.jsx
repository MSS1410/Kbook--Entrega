// components/StepBar.jsx
import React from 'react'
import styled from 'styled-components'

const StepsBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md}; /* gap entre steps top */
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`
const Step = styled.div`
  flex: 1; // cada paso ocupa mismo ancho
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.sm};

  background: ${({ active, completed, theme }) =>
    // color segun situacion
    completed ? '#d4edda' : active ? theme.colors.mutedSurface : '#f0f0f0'};

  display: flex;
  flex-direction: column;
  align-items: center;
  font-weight: bold;
  span {
    margin-top: 4px;
    font-size: 0.85rem;
  }
`

export default function StepBar({ step }) {
  // steps 1 2 3
  return (
    <StepsBar>
      <Step active={step === 1} completed={step > 1}>
        1<span>Datos de envío</span>
      </Step>
      <Step active={step === 2} completed={step > 2}>
        2<span>Pago</span>
      </Step>
      <Step active={step === 3} completed={step === 3}>
        3<span>Revisión</span>
      </Step>
    </StepsBar>
  )
}
