// frontend/src/admin/pages/reviews/AdminReviews.jsx
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import LatestReviewsCarousel from '../../components/reviews/reviewsAdmin/LatestReviewsCarousel.jsx'
import TopUsersChips from '../../components/reviews/reviewsAdmin/TopUsersChips.jsx'
import TopBooksChips from '../../components/reviews/reviewsAdmin/TopBooksChips.jsx'
import { listReviews, computeReviewStats } from '../../api/adminApi.js'
import { absUrl } from '../../../../utils/absUrl.js'
import { AVATAR_PLACEHOLDER } from '../../../../constants/media.js'
const Wrap = styled.div`
  display: grid;
  gap: 24px;
`
const Head = styled.div`
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  h2 {
    font-size: 22px;
    line-height: 1.2;
    margin: 0;
  }
  small {
    color: ${({ theme }) => theme.colors.mutedText};
    display: block;
  }
`

export default function AdminReviews() {
  const [latest, setLatest] = useState([])
  const [loadingLatest, setLoadingLatest] = useState(true)

  const [topUsers, setTopUsers] = useState([])
  const [topBooks, setTopBooks] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        setLoadingLatest(true)
        const res = await listReviews({ page: 1, limit: 15 })
        setLatest(Array.isArray(res?.reviews) ? res.reviews : [])
      } finally {
        setLoadingLatest(false)
      }
    })()
    ;(async () => {
      try {
        setLoadingStats(true)
        const { topUsers, topBooks } = await computeReviewStats(5, 200)
        setTopUsers(topUsers.slice(0, 12))
        setTopBooks(topBooks.slice(0, 12))
      } finally {
        setLoadingStats(false)
      }
    })()
  }, [])

  const items = useMemo(
    () =>
      latest.map((r) => {
        const user = typeof r.user === 'object' ? r.user : null
        const book = typeof r.book === 'object' ? r.book : null
        return {
          id: r._id,
          rating: r.rating,
          comment: r.comment || '',
          createdAt: r.createdAt,
          userName: user?.name || 'Usuario',
          userAvatar: absUrl(user?.avatar || r?.avatar || ''),
          userId: user?._id || '',
          bookTitle: book?.title || 'Libro',
          bookCover: absUrl(book?.coverImage || ''),
          bookId: book?._id || ''
        }
      }),
    [latest]
  )

  return (
    <Wrap>
      <Head>
        <div>
          <h2>Reseñas</h2>
          <small>Resumen y rankings</small>
        </div>
      </Head>

      <LatestReviewsCarousel items={items} loading={loadingLatest} />
      <TopUsersChips topUsers={topUsers} loading={loadingStats} />
      <TopBooksChips topBooks={topBooks} loading={loadingStats} />
    </Wrap>
  )
}
