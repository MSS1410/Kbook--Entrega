import React from 'react'
import styled from 'styled-components'

const InfoGrid = styled.div`
  display: grid;
  gap: 18px;
`
const Card = styled.article`
  display: grid;
  grid-template-columns: ${(props) =>
    props.$flip ? '0.7fr 1.3fr' : '1.3fr 0.7fr'};
  align-items: center;
  gap: 18px;
  padding: 20px;
  border-radius: ${({ theme }) => theme.radii?.lg || '16px'};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#efefef'};
  background: ${({ theme }) => theme.colors?.cardBg || '#fff'};
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.04);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`
const CardText = styled.div``
const CardTitle = styled.h2`
  margin: 0 0 6px 0;
  font-size: 20px;
  color: ${({ theme }) => theme.colors?.primary || '#8b5cf6'};
`
const CardDesc = styled.p`
  margin: 0;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors?.mutedText || '#555'};
`
const Art = styled.div`
  --imgSize: clamp(120px, 22vw, 220px);
  width: var(--imgSize);
  height: var(--imgSize);
  border-radius: 14px;
  overflow: hidden;
  background: #f8f8ff;
  box-shadow: 0 1px 12px rgba(0, 0, 0, 0.06);
  justify-self: center;
  ${(p) => p.$left && `justify-self: start;`}
  @media (max-width: 900px) {
    width: clamp(120px, 40vw, 200px);
    height: clamp(120px, 40vw, 200px);
  }
`
const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
`
// pinta lista de tarjetas informativas sobre kbook
// props: card recibe $flip para decidir orden de columnas,
// art recibe $left, para alinear imagen izq alternando
export default function InfoSection({ items = [] }) {
  return (
    <InfoGrid>
      {items.map((item, idx) => {
        const flip = idx % 2 === 1
        return (
          <Card key={item.title} $flip={flip}>
            <CardText style={{ order: flip ? 2 : 1 }}>
              <CardTitle>{item.title}</CardTitle>
              <CardDesc>{item.desc}</CardDesc>
            </CardText>
            <Art $left={flip} style={{ order: flip ? 1 : 2 }}>
              <Img src={item.img} alt={item.alt || item.title} loading='lazy' />
            </Art>
          </Card>
        )
      })}
    </InfoGrid>
  )
}
