// frontend/src/features/admin/layout/AdminLayout.jsx
import React from 'react'
import styled from 'styled-components'
import { Outlet } from 'react-router-dom'
import AdminHeader from '../components/AdminHeader.jsx'
import AdminFooter from '../components/AdminFooter.jsx'
import ScrollToTop from '../../../components/scrollToTop.jsx'

const HEADER_H = 64

const Page = styled.div`
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.bg};
  overflow-x: hidden;
`

const HeaderSpacer = styled.div`
  height: ${HEADER_H}px;
  flex: 0 0 ${HEADER_H}px;
`

const Main = styled.main`
  max-width: 1120px;
  margin: 0 auto;
  padding: 32px 16px 32px;
  width: 100%;
  flex: 1;
`

export default function AdminLayout({ children }) {
  return (
    <Page>
      <AdminHeader />
      <HeaderSpacer />
      <ScrollToTop /> {/* 👈 siempre arriba al cambiar de ruta */}
      <Main>{children ?? <Outlet />}</Main>
      <AdminFooter />
    </Page>
  )
}
