import React from 'react'
import styled from 'styled-components'

const Track = styled.div`
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`
const Row = styled.div`
  display: inline-flex;
  gap: 16px;
  padding-right: 4px;
`

export default function HScroll({ children }) {
  return (
    <Track>
      <Row>{children}</Row>
    </Track>
  )
}
