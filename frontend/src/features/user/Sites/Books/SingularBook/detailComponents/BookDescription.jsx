import React from 'react'
import styled, { useTheme } from 'styled-components'

const SectionTitle = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  font-size: ${({ theme }) => theme.fontSizes.xl};
`
// mostrara la descri del libro
export default function BookDescription({ synopsis = '' }) {
  const theme = useTheme()
  return (
    <>
      <SectionTitle>Descripción</SectionTitle>
      <p style={{ margin: 0, color: theme.colors.onSurface }}>{synopsis}</p>
    </>
  )
}
