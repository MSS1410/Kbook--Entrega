import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import api from '../api'

const Wrap = styled.section`
  margin: 24px 0;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;
`

const H2 = styled.h2`
  margin: 0;
`

const ViewAll = styled(Link)`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`

const Row = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 8px;

  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 8px;
  }
`

const Card = styled(Link)`
  flex: 0 0 auto;
  width: 180px;
  scroll-snap-align: start;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Avatar = styled.img`
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
  background: #f0f0f0;
  display: block;
`

const Name = styled.div`
  margin-top: 10px;
  font-weight: 700;
  font-size: 0.98rem;
  text-align: center;

  display: -webkit-box;
  -webkit-line-clamp: 2; /* hasta 2 líneas */
  -webkit-box-orient: vertical;
  overflow: hidden;
`

export default function AuthorsCarousel() {
  const [authors, setAuthors] = useState([])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await api.get('/api/authors/for-carousel', {
          params: { limit: 12 }
        })
        const list = Array.isArray(res.data?.authors)
          ? res.data.authors
          : Array.isArray(res.data)
          ? res.data
          : []
        setAuthors(list)
      } catch (e) {
        console.error('No se pudieron cargar autores', e)
        setAuthors([])
      }
    })()
  }, [])

  if (!authors.length) return null

  return (
    <Wrap>
      <Header>
        <H2>Autores</H2>
        <ViewAll to='/authors'>Ver todos</ViewAll>
      </Header>

      <Row>
        {authors.map((a) => (
          <Card key={a._id} to='/authors'>
            {a.photo && (
              <Avatar
                src={a.photo}
                alt={a.name}
                onError={(e) => {
                  e.currentTarget.style.visibility = 'hidden'
                }}
              />
            )}
            <Name title={a.name}>{a.name}</Name>
          </Card>
        ))}
      </Row>
    </Wrap>
  )
}
