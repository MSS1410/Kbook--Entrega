// frontend/src/components/AuthorSingCard.jsx
import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const Item = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: inherit;
  background: transparent; /* sin rectángulo */
  padding: 8px; /* pequeño respiro para el hover */
  border-radius: 12px; /* opcional, casi imperceptible */
  &:hover ._avatar img {
    transform: scale(1.03);
  }
`

const Avatar = styled.div`
  width: 148px; /* un poco más grande */
  height: 148px;
  border-radius: 9999px; /* redondo */
  overflow: hidden;
  position: relative;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1); /* sutil relieve */
  flex-shrink: 0;
  & > img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* foto bien encuadrada */
    display: block;
    transition: transform 0.25s ease;
  }
`

const Name = styled.div`
  max-width: 160px; /* coherente con el avatar */
  text-align: center;
  font-weight: 700;
  line-height: 1.2;
  font-size: 0.95rem;
  display: -webkit-box; /* evita que se “corten” mal */
  -webkit-line-clamp: 2; /* 2 líneas como máximo */
  -webkit-box-orient: vertical;
  overflow: hidden;
`

export default function AuthorSingCard({ author }) {
  // asumimos que SIEMPRE hay foto y biografía, como acordamos
  const to = `/books?author=${author._id}` // o `/authors/${author._id}` si lo prefieres
  return (
    <Item to={to} aria-label={`Ver libros de ${author.name}`}>
      <Avatar className='_avatar'>
        <img src={author.photo} alt={author.name} />
      </Avatar>
      <Name>{author.name}</Name>
    </Item>
  )
}
