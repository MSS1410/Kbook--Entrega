import React, { useState, useEffect } from 'react'
import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'

// Styled-components using transient props ($bg, $active) to avoid passing to DOM
const Carousel = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 400px;
`

const Slide = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url(${(props) => props.$bg}) center/cover no-repeat;
  display: ${(props) => (props.$active ? 'flex' : 'none')};
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.colors.onPrimary};
  text-align: center;
  transition: opacity 1s ease-in-out;
`

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`
const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
`
const Button = styled(Link)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  text-decoration: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`
const Dots = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`
const Dot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(props) =>
    props.$active ? props.theme.colors.primary : '#ffffff80'};
  cursor: pointer;
`

const slides = [
  {
    bg: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1950&q=80',
    title: 'Bienvenido a KBook Store',
    subtitle: 'Descubre y compra tus libros favoritos',
    btnText: 'Explorar Libros',
    btnLink: '/books'
  },
  {
    bg: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1950&q=80',
    title: 'Conoce a Nuestros Autores',
    subtitle: 'Visita nuestros escritores destacados',
    btnText: 'Autores',
    btnLink: '/authors'
  },
  {
    bg: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1950&q=80',
    title: 'Nuevas Publicaciones',
    subtitle: 'Mantente al día con las últimas novedades',
    btnText: 'New Releases',
    btnLink: '/books?sort=createdAt'
  },
  {
    bg: 'https://unsplash.com/es/fotos/una-persona-parada-en-una-habitacion-con-estantes-de-libros-bw-nDU5MTKs',

    title: 'Ofertas Especiales',
    subtitle: 'Descubre descuentos exclusivos',
    btnText: 'Ofertas',
    btnLink: '/books?offers=true'
  },
  {
    bg: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1950&q=80',
    title: 'Reseñas Destacadas',
    subtitle: 'Lee lo que dicen nuestros lectores',
    btnText: 'Reseñas',
    btnLink: '/reviews'
  }
]

export default function BannerSect() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      8500
    )
    return () => clearInterval(timer)
  }, [])

  return (
    <Carousel>
      {slides.map((s, i) => (
        <Slide key={i} $bg={s.bg} $active={i === index}>
          <Title>{s.title}</Title>
          <Subtitle>{s.subtitle}</Subtitle>
          <Button to={s.btnLink}>{s.btnText}</Button>
        </Slide>
      ))}
      <Dots>
        {slides.map((_, i) => (
          <Dot key={i} $active={i === index} onClick={() => setIndex(i)} />
        ))}
      </Dots>
    </Carousel>
  )
}
