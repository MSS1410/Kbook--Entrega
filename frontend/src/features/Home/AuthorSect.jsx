// frontend/src/features/Home/AuthorSect.jsx
import React, { useEffect, useState } from 'react'
import HomeCarrusel from '../../components/HomeCarrusels'
import AuthorSingCard from '../../components/authorSingCard'
import api from '../../api'

export default function AuthorSect() {
  const [authors, setAuthors] = useState([])

  useEffect(() => {
    api
      .get('/api/authors?featured=true&limit=12')
      .then((res) =>
        setAuthors((Array.isArray(res.data) ? res.data : []).slice(0, 12))
      )
      .catch(console.error)
  }, [])

  const items = authors.map((a) => ({
    id: a._id,
    component: <AuthorSingCard author={a} />
  }))

  return (
    <HomeCarrusel
      title='Autores Destacados'
      items={items}
      viewAllLink='/authors'
      itemWidth={180} // << tamaño de “célula” (ancho)
      itemGap={16} // << separación entre ítems
    />
  )
}
