import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import HomeCarrusel from '../../components/HomeCarrusels'
import api from '../../api/index'

const Section = styled.section`
  margin-bottom: 2rem;
`
export default function ListCategory({ category, title, viewAllLink }) {
  const [books, setBooks] = useState([])
  useEffect(() => {
    api
      .get(`/api/books?category=${encodeURIComponent(category)}&limit=12`)
      .then((res) => {
        const arr = Array.isArray(res.data) ? res.data : res.data.books || []
        setBooks(arr)
      })
      .catch(() => setBooks([]))
  }, [category])
  const items = books.map((b) => ({
    id: b._id,
    component: <img src={b.coverImage} alt={b.title} />,
    link: `/books/${b._id}`
  }))
  return (
    <Section>
      <HomeCarrusel title={title} items={items} viewAllLink={viewAllLink} />
    </Section>
  )
}
