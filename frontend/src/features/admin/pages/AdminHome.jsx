// frontend/src/features/admin/pages/AdminHome.jsx
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { fetchAdminHome } from '../api/adminApi.js'

// Secciones
import RecentActivitySection from '../components/home/RecentActivitySection.jsx'
import RecentUsersSection from '../components/home/RecentUsersSection.jsx'
import EconomySection from '../components/home/EconomySection.jsx'
import RecentReviewsSection from '../components/home/RecentReviewsSection.jsx'

const PageWrap = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xl};
`

export default function AdminHome() {
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [data, setData] = useState({
    users: [],
    orders: [],
    metrics: { series: [], totalAmount: 0, totalOrders: 0, usersTotal: 0 },
    inbox: [],
    reviews: []
  })

  useEffect(() => {
    ;(async () => {
      try {
        const d = await fetchAdminHome()
        setData(d)
      } catch (e) {
        setErr(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const metrics = useMemo(() => data?.metrics || {}, [data])

  if (loading) {
    return (
      <PageWrap>
        {/* Skeleton muy ligero */}
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              height: 120,
              borderRadius: 16,
              background: '#f1f5f9',
              animation: 'pulse 1.2s infinite'
            }}
          />
        ))}
      </PageWrap>
    )
  }

  if (err) {
    return (
      <PageWrap>
        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            background: '#fff',
            padding: 16,
            color: '#b91c1c',
            fontSize: 14
          }}
        >
          Ha ocurrido un error: {String(err)}
        </div>
      </PageWrap>
    )
  }

  return (
    <PageWrap>
      <RecentActivitySection metrics={metrics} />
      <RecentUsersSection users={data.users} />
      <EconomySection orders={data.orders} series={metrics.series} />
      <RecentReviewsSection reviews={data.reviews} />
    </PageWrap>
  )
}
