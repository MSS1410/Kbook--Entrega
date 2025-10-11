import React from 'react'
import styled from 'styled-components'
import ReviewListCard from './ReviewListCard.jsx'

const Grid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); // ← responsive
  align-items: stretch;
  min-width: 0;
`

export default function ReviewsGrid({ reviews, deletingIds, onDelete }) {
  return (
    <Grid>
      {reviews.map((r) => (
        <ReviewListCard
          key={r._id}
          r={r}
          // muestra “Eliminando…” si escae
          deleting={deletingIds.has(r._id)}
          onDelete={onDelete}
        />
      ))}
    </Grid>
  )
}
