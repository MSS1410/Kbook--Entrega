import React from 'react'
import styled from 'styled-components'
import HomeCarrusel from '../../components/HomeCarrusels'
import { Link } from 'react-router-dom'

const Card = styled.div`
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.sm};
  height: 100%;
  width: 100%;
  &:hover img {
    transform: scale(1.1);
  }
`
const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
`
const Label = styled.span`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
  opacity: 0;
  transition: opacity 0.3s;
  ${Card}:hover & {
    opacity: 1;
  }
`

export default function CategoriesSect() {
  const categories = [
    { name: 'Ciencia Ficción', img: 'src/assets/images/cienciaFiccion.webp' },
    { name: 'Ciencia', img: 'src/assets/images/ciencia.jpg' },
    { name: 'Infantiles', img: 'src/assets/images/infantil.jpg' },
    { name: 'Aventuras', img: 'src/assets/images/aventuras.jpg' },
    { name: 'Historia', img: 'src/assets/images/historia.jpg' },
    { name: 'Psicologia', img: 'src/assets/images/psicologia.jpg' },
    { name: 'Natura', img: 'src/assets/images/Natura.jpg' }
  ]
  const items = categories.map((cat) => ({
    id: cat.name,
    component: (
      <Card>
        <Img src={cat.img} alt={cat.name} />
        <Label>{cat.name}</Label>
      </Card>
    ),
    link: `/categories/${encodeURIComponent(cat.name)}`
  }))
  return (
    <HomeCarrusel title='Categorías' items={items} viewAllLink='/categories' />
  )
}
