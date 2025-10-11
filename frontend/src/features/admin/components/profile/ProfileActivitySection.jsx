import React from 'react'
import styled from 'styled-components'

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  padding: 16px;
  display: grid;
  gap: 8px;
`
const SectionTitle = styled.h3`
  margin: 0 0 6px 0;
  font-size: 18px;
`
const Muted = styled.div`
  color: #64748b;
  font-size: 14px;
`

export default function ProfileActivitySection({ lastLogin }) {
  // fecha de ultimo login + formateo de esta
  return (
    <Card>
      <SectionTitle>Actividad reciente</SectionTitle>
      <Muted>
        Última conexión:{' '}
        {lastLogin ? new Date(lastLogin).toLocaleString() : '—'}
      </Muted>
      <div style={{ color: '#9CA3AF', fontSize: 13, marginTop: 6 }}>
        Historial de acciones (solo muestreo).
        <em>audit log</em>.
      </div>
    </Card>
  )
}
