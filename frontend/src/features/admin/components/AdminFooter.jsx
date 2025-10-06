import React from 'react'
import styled from 'styled-components'
import { BookOpen } from 'lucide-react'

const Wrap = styled.footer`
  border-top: 1px solid #e2e8f0;
  margin-top: 40px;
  background: rgb(90, 24, 133);
  color: #e8e8ea;
`
const Container = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: 24px 16px;
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
  align-items: center;
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`
const Brand = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
`
const MutedRight = styled.div`
  color: #00b67a;
  font-size: 14px;
  text-align: right;
`

export default function AdminFooter() {
  return (
    <Wrap>
      <Container>
        <div>
          <Brand>
            <BookOpen size={18} /> KBOOK Admin
          </Brand>
          <div style={{ marginTop: 8, color: '#00b67a', fontSize: 14 }}>
            Panel para gestionar biblioteca, autores, usuarios, pedidos y
            reseñas.
          </div>
        </div>
        <div />
        <MutedRight>
          © {new Date().getFullYear()} KBOOK. Todos los derechos reservados.
        </MutedRight>
      </Container>
    </Wrap>
  )
}
