// frontend/src/components/layout/Layout.jsx
import React, { useEffect, useState } from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import styled from 'styled-components'
import CarritoAside from '../carrito/carritoAside'
import ScrollToTop from '../scrollToTop' // 👈

const Main = styled.main`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.md};
  padding-top: calc(var(--header-offset, 0px) + 16px);
  min-height: calc(100vh - 200px);
`

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 951;
`

export default function Layout({ children }) {
  const [cartOpen, setCartOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const open = () => setCartOpen(true)
    const close = () => setCartOpen(false)
    window.addEventListener('cart:open', open)
    window.addEventListener('cart:close', close)
    return () => {
      window.removeEventListener('cart:open', open)
      // escucho eventos globales de cart, al loro con las compritas
      window.removeEventListener('cart:close', close)
    }
  }, [])

  useEffect(() => {
    setCartOpen(false)
    // al navegadr , cierro cart
  }, [location.pathname])

  return (
    <>
      <Header />
      <ScrollToTop /> {/*  siempre arriba... como españita */}
      <Main>{children ?? <Outlet />}</Main>
      {/* soporta childreno rutas anidadas */}
      <Footer />
      {cartOpen && (
        // over del cart
        <>
          <Backdrop onClick={() => setCartOpen(false)} />
          {/* OUTCLICK close cart igual que */}
          <CarritoAside onClose={() => setCartOpen(false)} />
          {/* "x" */}
        </>
      )}
    </>
  )
}
