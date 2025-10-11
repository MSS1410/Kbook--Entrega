import React from 'react'
import styled from 'styled-components'
import { Outlet } from 'react-router-dom'
import AdminHeader from '../components/layout/AdminHeader.jsx'
import AdminFooter from '../components/layout/AdminFooter.jsx'
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

/**
 ---_----- Layout de Admin: ----_-----
-Header fijo fuera de flujo, tratamos espacio para evitar solapes
- ScrollToTop: obliga a siempre arrancar desde arriba
- Main: renderiza children o <Outlet/>  para cuando se use para anidadas routes
- Footer 
 */
export default function AdminLayout({ children }) {
  return (
    <Page>
      <AdminHeader />
      <HeaderSpacer />
      <ScrollToTop /> {/* siempre arriba al cambiar de ruta */}
      <Main>{children ?? <Outlet />}</Main>
      <AdminFooter />
    </Page>
  )
}
