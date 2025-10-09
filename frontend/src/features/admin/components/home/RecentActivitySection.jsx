// frontend/src/features/admin/components/home/RecentActivitySection.jsx
import React, { useMemo } from 'react'
import styled from 'styled-components'
import Section from '../../components/Section.jsx'
import Kpi from '../../components/cards/KpiCard.jsx'
import {
  Users as UsersIcon,
  ShoppingCart,
  BarChart2,
  BookOpen
} from 'lucide-react'

const Panel = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
`

const Grid = styled.div`
  display: grid;
  gap: 16px;
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`

const currency = (n) =>
  typeof n === 'number'
    ? n.toLocaleString(undefined, { style: 'currency', currency: 'EUR' })
    : n

export default function RecentActivitySection({ metrics }) {
  const kpis = useMemo(() => {
    const totalUsers = metrics?.usersTotal ?? 0
    const totalOrders = metrics?.totalOrders ?? 0
    const totalSales = metrics?.totalAmount ?? 0
    const avgTicket =
      totalOrders > 0 ? Number(totalSales / totalOrders).toFixed(2) : 0

    return [
      {
        label: 'Usuarios (total)',
        value: totalUsers,
        icon: <UsersIcon size={20} />
      },
      {
        label: 'Pedidos (total)',
        value: totalOrders,
        icon: <ShoppingCart size={20} />
      },
      {
        label: 'Ventas (total)',
        value: currency(totalSales),
        icon: <BarChart2 size={20} />
      },
      {
        label: 'Ticket medio',
        value: currency(Number(avgTicket)),
        icon: <BookOpen size={20} />
      }
    ]
  }, [metrics])

  return (
    <Panel>
      <Section
        title='Actividad Reciente'
        subtitle='Resumen de los ultimos eventos'
      />
      <Grid>
        {kpis.map((k) => (
          <Kpi key={k.label} {...k} />
        ))}
      </Grid>
    </Panel>
  )
}
