import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { fetchAdminHome } from '../api/adminApi.js' // API: trae el dashboard payload

// Secciones
import RecentActivitySection from '../components/home/RecentActivitySection.jsx'
import RecentUsersSection from '../components/home/RecentUsersSection.jsx'
import EconomySection from '../components/home/EconomySection.jsx'
import RecentReviewsSection from '../components/home/RecentReviewsSection.jsx'

const PageWrap = styled.div`
  display: grid;
  gap: ${({ theme }) =>
    theme.spacing.xl}; // ← separación consistente entre secciones
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  @media (min-width: 480px) {
    padding: 16px;
  }
  @media (min-width: 768px) {
    padding: 20px;
  }
  @media (min-width: 1024px) {
    padding: 24px;
  }
`

export default function AdminHome() {
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [data, setData] = useState({
    //  estado principal con todo el payload
    users: [],
    orders: [],
    metrics: { series: [], totalAmount: 0, totalOrders: 0, usersTotal: 0 },
    inbox: [],
    reviews: []
  })

  useEffect(() => {
    ;(async () => {
      try {
        const d = await fetchAdminHome() // llama backend agrega users/orders/metrics/reviews
        setData(d) // guarda el resultado tal cual
      } catch (e) {
        setErr(e) // error al fallo
      } finally {
        setLoading(false)
      }
    })()
  }, []) // unica carga al montar

  const metrics = useMemo(() => data?.metrics || {}, [data]) // memo para evitar renders extra

  if (loading) {
    return (
      <PageWrap>
        {/* Skelet */}
        {[...Array(4)].map(
          (
            _,
            i // 4 placeholders de secciones
          ) => (
            <div
              key={i}
              style={{
                height: 120,
                borderRadius: 16,
                background: '#f1f5f9',
                animation: 'pulse 1.2s infinite'
              }}
            />
          )
        )}
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
      {/* KPIes con cifras agregadas */}
      <RecentActivitySection metrics={metrics} />
      {/* last users en carrusel horizontal */}
      <RecentUsersSection users={data.users} />
      {/* pedidos recientes con grfica 30 DIAS*/}
      <EconomySection orders={data.orders} series={metrics.series} />
      {/* reseñas recientes */}
      <RecentReviewsSection reviews={data.reviews} />
    </PageWrap>
  )
}
