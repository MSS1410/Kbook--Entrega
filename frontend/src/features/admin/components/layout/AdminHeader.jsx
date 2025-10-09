import React from 'react'
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

const HeaderWrap = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;

  z-index: 1000; /* ↑ por delante del contenido */
  isolation: isolate; /* nuevo stacking-context seguro */
  backdrop-filter: blur(6px);
  background: ${({ theme }) =>
    theme.colors.headerBg || 'rgba(255,255,255,0.85)'};
  color: ${({ theme }) => theme.colors.headerText};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); /* separador suave */
`

const Container = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 16px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.headerText};
  text-decoration: none;
`
const Nav = styled.nav`
  display: none;
  gap: 12px;
  @media (min-width: 900px) {
    display: inline-flex;
  }
`
const NavLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 9999px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.headerText};
  text-decoration: none;
  border: 1px solid transparent;
  &:hover {
    background: ${({ theme }) => theme.colors.mutedSurface};
    border-color: ${({ theme }) => theme.colors.border};
  }
`
const IconBtn = styled.button`
  height: 36px;
  width: 36px;
  border: 0;
  border-radius: 9999px;
  background: transparent;
  display: inline-grid;
  place-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.headerText};
  &:hover {
    background: ${({ theme }) => theme.colors.mutedSurface};
  }
`

export default function AdminHeader() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const items = [
    { to: '/admin/books', label: 'Biblioteca', icon: <Library size={16} /> },
    { to: '/admin/authors', label: 'Autores', icon: <PenTool size={16} /> },
    { to: '/admin/users', label: 'Usuarios', icon: <Users size={16} /> },
    { to: '/admin/orders', label: 'Pedidos', icon: <ShoppingCart size={16} /> },
    { to: '/admin/reviews', label: 'Reseñas', icon: <Star size={16} /> },
    { to: '/admin/contact', label: 'Contacto', icon: <Mail size={16} /> }
  ]

  return (
    <HeaderWrap>
      <Container>
        <Brand to='/admin' aria-label='KBOOK Admin'>
          <BookOpen size={20} />
          <span>KBOOK Admin</span>
        </Brand>

        <Nav>
          {items.map((it) => (
            <NavLink key={it.to} to={it.to}>
              {it.icon}
              {it.label}
            </NavLink>
          ))}
        </Nav>

        <div style={{ display: 'inline-flex', gap: 8 }}>
          <Link to='/admin/profile' aria-label='Mi perfil (admin)'>
            <IconBtn title='Mi perfil (admin)'>
              <UserCircle size={18} />
            </IconBtn>
          </Link>

          {/* <Link to='/admin/books' aria-label='Biblioteca'>
            <IconBtn title='Biblioteca'>
              <Library size={18} />
            </IconBtn>
          </Link> */}

          <IconBtn
            title='Logout'
            onClick={() => {
              logout?.()
              navigate('/login')
            }}
          >
            <LogOut size={18} />
          </IconBtn>
        </div>
      </Container>
    </HeaderWrap>
  )
}
