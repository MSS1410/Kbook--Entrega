import React, { useEffect, useState } from 'react'
import api from '../../api/index'
import styled from 'styled-components'

const SectionRev = styled.section`
  margin-bottom: 2rem;
`
const TitleRev = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`
const List = styled.ul`
  list-style: none;
  padding: 0;
`
const Item = styled.li`
  margin-bottom: 1rem;
`
const User = styled.strong`
  display: block;
  margin-bottom: 0.25rem;
`

export default function ReviewsPreview() {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    api
      .get('/api/reviews?limit=4&sort=-createdAt')
      .then((res) => setReviews(res.data))
      .catch((err) => console.error(err))
  }, [])

  return (
    <SectionRev>
      <TitleRev>¿Quieres dejar tu huella en KbooK?</TitleRev>
      <List>
        {reviews.map((r) => (
          <Item key={r._id}>
            <User>{r.user.name}</User>
            <span>“{r.comment}”</span>
          </Item>
        ))}
      </List>
    </SectionRev>
  )
}
