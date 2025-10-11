import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Library,
  Users,
  PenTool,
  ShoppingCart,
  Star,
  Mail,
  UserCircle,
  LogOut
} from 'lucide-react'
import useAuth from '../../../../hooks/useAuth'
import MobileNavDrawer from './burguerPhone/MobileNavDrawer' //navPhone

const HeaderWrap = styled.header`
  position: fixed; // ← header fijo (siempre visible)
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000; /* ↑ por delante del contenido */
  isolation: isolate; /* nuevo stacking-context seguro */
  backdrop-filter: blur(6px); // ← blur sutil sobre contenido
  background: ${({ theme }) =>
    theme.colors.headerBg ||
    'rgba(255,255,255,0.85)'}; // ← semi-transparente de fallback
  color: ${({ theme }) => theme.colors.headerText};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); /* separador suave */

  /* evita saltos con zonas seguras en iOS */
  padding-top: env(safe-area-inset-top);
`

const Container = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 12px;
  height: 56px; // ← altura más compacta en móvil
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (min-width: 768px) {
    padding: 0 16px;
    height: 60px; // ← iPad
  }
  @media (min-width: 1024px) {
    padding: 0 20px;
    height: 64px; // ← desktop
  }
`

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.headerText};
  text-decoration: none;
  min-width: 0;
  /* evita que el nombre empuje al Nav en anchos medios */
  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

const Nav = styled.nav`
  display: none; // ← oculto en mobile
  gap: 8px;

  /* iPad: nav visible y desplazable horizontalmente */
  @media (min-width: 768px) {
    display: inline-flex; // ← visible desde 768px (antes 900px)
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    max-width: 60vw; /* evita que choque con acciones derechas */
    scroll-snap-type: x proximity;
  }

  @media (min-width: 1024px) {
    max-width: none;
    overflow: visible;
    gap: 12px; /* más aire en desktop */
  }
`

const NavLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 9999px; // ← pills
  font-size: 14px;
  color: ${({ theme }) => theme.colors.headerText};
  text-decoration: none;
  border: 1px solid transparent;
  scroll-snap-align: start;

  &:hover {
    background: ${({ theme }) => theme.colors.mutedSurface};
    border-color: ${({ theme }) => theme.colors.border};
  }

  /* densidad ligeramente mayor en iPad para tocar cómodo */
  @media (min-width: 768px) and (max-width: 1023px) {
    padding: 10px 14px;
  }
`

const RightActions = styled.div`
  display: inline-flex;
  gap: 6px;

  @media (min-width: 768px) {
    gap: 8px;
  }
`

const IconBtn = styled.button`
  height: 36px;
  width: 36px; // ← botones icónicos compactos
  border: 0;
  border-radius: 9999px;
  background: transparent;
  display: inline-grid;
  place-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.headerText};
  flex: 0 0 auto;

  &:hover {
    background: ${({ theme }) => theme.colors.mutedSurface};
  }

  /* iPhone: hit-area algo mayor sin cambiar el layout */
  @media (max-width: 767px) {
    height: 40px;
    width: 40px;
  }
`

/* burguir */
const HamburgerBtn = styled(IconBtn)`
  display: inline-grid;

  @media (min-width: 768px) {
    display: none; /* oculto en iPad/desktop donde ya mostramos el Nav */
  }
`

export default function AdminHeader() {
  const navigate = useNavigate()
  const { logout } = useAuth() // traigo logout

  const items = [
    { to: '/admin/books', label: 'Biblioteca', icon: <Library size={16} /> },
    { to: '/admin/authors', label: 'Autores', icon: <PenTool size={16} /> },
    { to: '/admin/users', label: 'Usuarios', icon: <Users size={16} /> },
    { to: '/admin/orders', label: 'Pedidos', icon: <ShoppingCart size={16} /> },
    { to: '/admin/reviews', label: 'Reseñas', icon: <Star size={16} /> },
    { to: '/admin/contact', label: 'Contacto', icon: <Mail size={16} /> }
  ] // menu principal admin

  // -state para movile
  const [menuOpen, setMenuOpen] = useState(false)

  // bloquea el scroll del body cuando el drawer está abierto (UX móvil)
  useEffect(() => {
    const prev = document.body.style.overflow
    if (menuOpen) document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  return (
    <HeaderWrap>
      <Container>
        <Brand to='/admin' aria-label='KBOOK Admin'>
          <BookOpen size={20} />
          {/* logo */}
          <span>KBOOK Admin</span>
        </Brand>

        {/* burguer but solo movil*/}
        <HamburgerBtn
          aria-label='Abrir menú'
          onClick={() => setMenuOpen(true)}
          title='Menú'
        >
          {/* importo aqui el icono burguer, evito imports */}
          <svg width='20' height='20' viewBox='0 0 24 24' aria-hidden='true'>
            <path
              d='M3 6h18M3 12h18M3 18h18'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
            />
          </svg>
        </HamburgerBtn>

        <Nav>
          {items.map((it) => (
            <NavLink key={it.to} to={it.to}>
              {it.icon}
              {it.label}
            </NavLink>
          ))}
        </Nav>

        <RightActions>
          <Link to='/admin/profile' aria-label='Mi perfil (admin)'>
            <IconBtn title='Mi perfil (admin)'>
              <UserCircle size={18} />
            </IconBtn>
          </Link>

          <IconBtn
            title='Logout'
            onClick={() => {
              logout?.() // close sesion
              navigate('/login') // back login
            }}
          >
            <LogOut size={18} />
          </IconBtn>
        </RightActions>
      </Container>

      {/* burguer para movil, enlaces nav */}
      <MobileNavDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={items}
      />
    </HeaderWrap>
  )
}
