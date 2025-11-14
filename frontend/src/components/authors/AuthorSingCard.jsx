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
  background: transparent;
  padding: 8px;
  border-radius: 12px;
  &:hover ._avatar img {
    transform: scale(1.03);
  }
`

const Avatar = styled.div`
  width: 148px;
  height: 148px;
  border-radius: 9999px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  & > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.25s ease;
  }
`

const Name = styled.div`
  max-width: 160px;
  text-align: center;
  font-weight: 700;
  line-height: 1.2;
  font-size: 0.95rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`
// recibo author, construyo un link que me enviara al page del aurthor, avatar circular y name
export default function AuthorSingCard({ author }) {
  const to = `/authors/${author._id}`
  return (
    <Item to={to} aria-label={`Ver página del autor ${author.name}`}>
      <Avatar className='_avatar'>
        <img src={author.photo} alt={author.name} />
      </Avatar>
      <Name>{author.name}</Name>
    </Item>
  )
}
