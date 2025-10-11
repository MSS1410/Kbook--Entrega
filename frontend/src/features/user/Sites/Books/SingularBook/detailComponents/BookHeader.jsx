import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const HeaderBlock = styled.header`
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: grid;
  gap: 8px;
`
const Title = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  line-height: 1.15;
  @media (max-width: 576px) {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }
`
const MetaBar = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
  color: ${({ theme }) => theme.colors.onSurface};
`
const AuthorLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 700;
  &:hover {
    text-decoration: underline;
  }
`
const Badge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.surfaceVariant};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.onSurface};
`
// mostraremos titulo, autor, link, badge de categoria
export default function BookHeader({ title, author, category }) {
  return (
    <HeaderBlock>
      <Title>{title}</Title>
      <MetaBar>
        {author?._id ? (
          <>
            de{' '}
            <AuthorLink to={`/authors/${author._id}`}>{author.name}</AuthorLink>
          </>
        ) : (
          <>
            de <strong>{author?.name || '—'}</strong>
          </>
        )}
        {category ? <Badge>{category}</Badge> : null}
      </MetaBar>
    </HeaderBlock>
  )
}
