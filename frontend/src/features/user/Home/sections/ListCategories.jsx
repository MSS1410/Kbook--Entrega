import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import HomeCarrusel from '../../../../components/carrouseles/HomeCarrusels'
import api from '../../../../api'

const Section = styled.section`
  margin-bottom: 2rem;
`
// props: cat title y view all link
export default function ListCategory({ category, title, viewAllLink }) {
  const [books, setBooks] = useState([])
  // libros como estado
  useEffect(() => {
    api
    // dispara get, al cambiar de category
      .get(`/api/books?category=${encodeURIComponent(category)}&limit=12`)
      .then((res) => {
        // normalizamos la respuesta
        const arr = Array.isArray(res.data) ? res.data : res.data.books || []
        setBooks(arr)
      })
      .catch(() => setBooks([]))
  }, [category])
  // mapeo cada libro con id componente card y link sobre el libro clickeado
  const items = books.map((b) => ({
    id: b._id,
    component: <img src={b.coverImage} alt={b.title} />,
    link: `/books/${b._id}`
  }))
  return (
    <Section>
      <HomeCarrusel title={title} items={items} viewAllLink={viewAllLink} />
      {/* render homecarrusel envuelto en seccion, una por cada cat */}
    </Section>
  )
}
