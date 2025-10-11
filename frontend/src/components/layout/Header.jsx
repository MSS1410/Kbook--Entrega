import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import styled from 'styled-components'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  FiMenu,
  FiX,
  FiUser,
  FiShoppingCart,
  FiSearch,
  FiChevronDown,
  FiChevronRight,
  FiChevronLeft,
  FiLogOut,
  FiBook,
  FiMail
} from 'react-icons/fi'
import useAuth from '../../hooks/useAuth'
import api from '../../api'

/*  Top Bar  */
const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.headerBg};
  color: ${({ theme }) => theme.colors.headerText};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const Logo = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.headerText};
  text-decoration: none;
  white-space: nowrap;
`

/* Desktop search */
const SearchForm = styled.form`
  flex: 1;
  max-width: 560px;
  margin: 0 ${({ theme }) => theme.spacing.md};
  position: relative;
  @media (max-width: 1000px) {
    display: none;
  }
`
const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.cardBg};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
  outline: none;
`
const SearchButton = styled.button`
  position: absolute;
  right: ${({ theme }) => theme.spacing.sm};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.headerText};
  display: grid;
  place-items: center;
`

const Icons = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`
const IconButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.headerText};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  cursor: pointer;
  display: inline-grid;
  place-items: center;
  border-radius: 10px;
  padding: 6px;
  position: relative;
  &:hover {
    background: ${({ theme }) => theme.colors.mutedSurface};
  }
`

/*  Bottom/Nav  */
const HeaderBottom = styled.div`
  background: ${({ theme }) => theme.colors.headerBg};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  position: relative;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const Nav = styled.nav`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
  @media (max-width: 1000px) {
    display: none;
  }
`
const NavItem = styled.div`
  position: relative;
`
const NavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.headerText};
  text-decoration: none;
  font-size: ${({ theme }) => theme.fontSizes.md};
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: ${({ theme }) => theme.spacing.xs} 0;
  &:hover {
    opacity: 0.85;
  }
`

const CatTrigger = styled.button`
  appearance: none;
  background: none;
  border: 0;
  padding: ${({ theme }) => theme.spacing.xs} 0;
  margin: 0;
  font: inherit;
  color: ${({ theme }) => theme.colors.headerText};
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  vertical-align: middle;
  &:hover {
    opacity: 0.85;
  }
`

const SubMenuWrap = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: ${({ open }) =>
    open ? 'translate(-50%,4px)' : 'translate(-50%,-6px)'};
  pointer-events: ${({ open }) => (open ? 'auto' : 'none')};
  opacity: ${({ open }) => (open ? 1 : 0)};
  transition: opacity 0.16s, transform 0.16s;
  z-index: 20;
`
const SubMenuPanel = styled.div`
  width: clamp(520px, 60vw, 940px);
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
  padding: ${({ theme }) => theme.spacing.md};
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 12px;
    height: 12px;
    background: ${({ theme }) => theme.colors.cardBg};
    border-left: 1px solid ${({ theme }) => theme.colors.border};
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }
`
const SubMenuHeader = styled.div`
  font-weight: 700;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text};
`
const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`
const SubLink = styled(Link)`
  display: block;
  padding: 10px 12px;
  border-radius: 10px;
  text-decoration: none;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.mutedSurface};
  &:hover {
    background: ${({ theme }) => theme.colors.cardBg};
    color: ${({ theme }) => theme.colors.accent};
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.colors.accent}33;
  }
`

/*  Header fijo  */
const HeaderShell = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 950; /* overlay móvil = 1000; backdrop carrito = 951 */
  background: ${({ theme }) => theme.colors.headerBg};
  box-shadow: ${({ $scrolled }) =>
    $scrolled ? '0 8px 24px rgba(0,0,0,0.08)' : 'none'};
  /* Aislamiento para evitar stacking raro con sombras/sugerencias */
  isolation: isolate;
`

/*  Mobile row (search + burger)  */
const MobileBar = styled.div`
  display: none;
  @media (max-width: 1000px) {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`
const MobileSearchForm = styled.form`
  flex: 1;
  position: relative;
`
const MobileSearchInput = styled.input`
  width: 100%;
  padding: 10px 42px 10px 12px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  outline: none;
  font-size: 0.95rem;
  background: ${({ theme }) => theme.colors.cardBg};
  color: ${({ theme }) => theme.colors.text};
`
const MobileSearchBtn = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.headerText};
  display: grid;
  place-items: center;
  cursor: pointer;
`
const Burger = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.headerText};
  display: inline-grid;
  place-items: center;
  padding: 6px;
  cursor: pointer;
  @media (min-width: 1001px) {
    display: none;
  }
`

/* overlay phone */
const Overlay = styled.div`
  display: ${({ open }) => (open ? 'flex' : 'none')};
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.cardBg};
  flex-direction: column;
  z-index: 1000;
`
const OverlayTopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`
const CloseIcon = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.headerText};
  display: inline-grid;
  place-items: center;
  cursor: pointer;
`
const OverlayNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: ${({ theme }) => theme.spacing.lg};
`
const OverlayLink = styled(Link)`
  text-decoration: none;
  color: ${({ theme }) => theme.colors.headerText};
  font-size: 1.05rem;
`
const OverlayRowBtn = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: ${({ theme }) => theme.colors.headerText};
  font-size: 1.05rem;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
`
const CatPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: ${({ theme }) => theme.spacing.lg};
`
const BackRow = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.headerText};
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 8px;
`

/* Sugerencias */
const SuggestBox = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  z-index: 50;
  padding: 6px;
`
const SugItem = styled(Link)`
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  border-radius: 10px;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text};
  &:hover {
    background: ${({ theme }) => theme.colors.mutedSurface};
  }
`
const SugCover = styled.img`
  width: 36px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  background: #eee;
`
const SugText = styled.div`
  display: flex;
  flex-direction: column;
`
const SugTitle = styled.div`
  font-weight: 600;
`
const SugMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.mutedText};
`

const categories = [
  'Ciencia Ficción',
  'Aventuras',
  'Historia',
  'Psicologia',
  'Infantiles',
  'Ciencia',
  'Natura'
]

export default function Header() {
  const [query, setQuery] = useState('') // texto de busqueda
  const [menuOpen, setMenuOpen] = useState(false) // overlay movil open
  const [catOpen, setCatOpen] = useState(false) // menu categorias para desktop - open
  const [catMobileOpen, setCatMobileOpen] = useState(false) // subpanel categorias
  const [scrolled, setScrolled] = useState(false) //   scroll

  const [suggestions, setSuggestions] = useState([])

  const [showSug, setShowSug] = useState(false)
  const [loadingSug, setLoadingSug] = useState(false)

  const debounceRef = useRef(null)
  const shellRef = useRef(null) // arreglar altura header

  const navigate = useNavigate()
  const location = useLocation()
  const { token, logout } = useAuth()
  const isAuth = ['/login', '/register'].includes(location.pathname)

  // Cerrar menu  desktop con click fuera
  const navRef = useRef()
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target))
        setCatOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    // salida esc
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setCatMobileOpen(false)
        setShowSug(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    setShowSug(false) // cambio de ruta, oculto suggerencias
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // calcula y publica altura de header como variable css para empujar y poner a sitio el main
  const publishOffset = () => {
    const h = shellRef.current?.offsetHeight || 0
    document.documentElement.style.setProperty('--header-offset', `${h}px`)
  }
  useLayoutEffect(() => {
    publishOffset()
    // al montar
    const ro =
      'ResizeObserver' in window
        ? new ResizeObserver(() => publishOffset())
        : null
    if (ro && shellRef.current) ro.observe(shellRef.current) // escucha los cambio de tamaño del header
    const onResize = () => publishOffset()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      if (ro && shellRef.current) ro.unobserve(shellRef.current)
    }
  }, [])

  const handleSearch = (e) => {
    // submit de busuqeda
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    navigate(`/books?search=${encodeURIComponent(q)}`)
    // navego a listado filtrado
    setQuery('')
    setShowSug(false)
    setMenuOpen(false)
    setCatMobileOpen(false)
  }

  const onQueryChange = (val) => {
    // escritura con busqueda
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.trim().length < 2) {
      // a partir de 2 letras
      setSuggestions([])
      setShowSug(false)
      return
    }
    setLoadingSug(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get('/api/search', {
          params: { q: val.trim(), limit: 6 }
        })
        const arr = Array.isArray(data?.books) ? data.books : []
        setSuggestions(arr) // OK RESULTS
        setShowSug(true)
      } catch {
        setSuggestions([]) // NON OK RESULTS
        setShowSug(false)
      } finally {
        setLoadingSug(false)
      }
    }, 250)
  }

  return (
    <>
      {/* header fijo */}
      <HeaderShell ref={shellRef} $scrolled={scrolled}>
        <HeaderTop>
          <Logo to='/'>KBook Store</Logo>
          {/* sin buscador en login reg */}
          {!isAuth && (
            <SearchForm onSubmit={handleSearch}>
              <SearchInput
                value={query}
                onChange={(e) => onQueryChange(e.target.value)} // on debounce
                placeholder='Buscar libros, autores, ISBN'
              />
              <SearchButton type='submit' aria-label='Buscar'>
                <FiSearch />
              </SearchButton>

              {showSug && (
                // cajoncito de sugg
                <SuggestBox>
                  {loadingSug && <div style={{ padding: 8 }}>Buscando…</div>}
                  {!loadingSug && suggestions.length === 0 && (
                    <div style={{ padding: 8 }}>Sin resultados</div>
                  )}
                  {suggestions.map((b) => (
                    <SugItem
                      key={b._id}
                      to={`/books/${b._id}`}
                      onClick={() => setShowSug(false)}
                      // close al elegir
                    >
                      {b.coverImage ? (
                        <SugCover src={b.coverImage} alt={b.title} />
                      ) : (
                        <div
                          style={{
                            width: 36,
                            height: 48,
                            background: '#eee',
                            borderRadius: 6
                          }}
                        />
                      )}
                      <SugText>
                        <SugTitle>{b.title}</SugTitle>
                        <SugMeta>
                          {typeof b.author === 'string'
                            ? b.author
                            : b.author?.name}
                        </SugMeta>
                      </SugText>
                    </SugItem>
                  ))}
                </SuggestBox>
              )}
            </SearchForm>
          )}

          <Icons>
            {!isAuth &&
              (token ? (
                // user auth OK
                <>
                  <IconButton
                    as={Link}
                    to='/inbox'
                    aria-label='Bandeja de entrada'
                    title='Bandeja de entrada'
                  >
                    <FiMail />
                  </IconButton>

                  <IconButton as={Link} to='/profile' aria-label='Perfil'>
                    <FiUser />
                  </IconButton>
                  <IconButton as={Link} to='/my-books' aria-label='Mis Libros'>
                    <FiBook />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      // LOG OUT y home
                      logout()
                      navigate('/')
                    }}
                    aria-label='Cerrar sesión'
                    title='Cerrar sesión'
                  >
                    <FiLogOut />
                  </IconButton>
                </>
              ) : (
                //  envio al login
                <IconButton as={Link} to='/login' aria-label='Iniciar sesión'>
                  <FiUser />
                </IconButton>
              ))}

            {!isAuth && (
              <IconButton
                type='button'
                aria-label='Abrir Carrito'
                // abre Drawerr, layout escucha
                onClick={() => window.dispatchEvent(new Event('cart:open'))}
                title='Carrito'
              >
                <FiShoppingCart size={18} />
              </IconButton>
            )}
          </Icons>
        </HeaderTop>

        {!isAuth && (
          <HeaderBottom ref={navRef}>
            <Nav>
              <NavLink to='/bestsellers'>Más Vendidos</NavLink>
              <NavLink to='/new-arrivals'>Nuevas Publicaciones</NavLink>

              <NavItem>
                <CatTrigger onClick={() => setCatOpen((v) => !v)}>
                  Categorías <FiChevronDown />
                </CatTrigger>
                <SubMenuWrap open={catOpen}>
                  <SubMenuPanel>
                    <SubMenuHeader>Categorías</SubMenuHeader>
                    <CategoriesGrid>
                      {categories.map((cat) => (
                        <SubLink
                          key={cat}
                          to={`/categories/${encodeURIComponent(cat)}`}
                          onClick={() => setCatOpen(false)}
                          // cierra al navegar
                        >
                          {cat}
                        </SubLink>
                      ))}
                    </CategoriesGrid>
                  </SubMenuPanel>
                </SubMenuWrap>
              </NavItem>

              <NavLink to='/authors'>Autores</NavLink>
              <NavLink to='/reviews'>Reseñas</NavLink>
              <NavLink to='/contact'>Contáctenos</NavLink>
            </Nav>

            {/*Phone ROW, burger */}
            <MobileBar>
              <MobileSearchForm onSubmit={handleSearch}>
                {/* adapto para funcionalidad en mobil */}
                <MobileSearchInput
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder='Buscar libros, autores, ISBN'
                />
                <MobileSearchBtn type='submit' aria-label='Buscar'>
                  <FiSearch />
                </MobileSearchBtn>

                {showSug && (
                  <SuggestBox>
                    {loadingSug && <div style={{ padding: 8 }}>Buscando…</div>}

                    {!loadingSug && suggestions.length === 0 && (
                      <div style={{ padding: 8 }}>Sin resultados</div>
                    )}
                    {suggestions.map((b) => (
                      <SugItem
                        key={b._id}
                        to={`/books/${b._id}`}
                        onClick={() => {
                          setShowSug(false)

                          setMenuOpen(false)
                        }}
                      >
                        {b.coverImage ? (
                          <SugCover src={b.coverImage} alt={b.title} />
                        ) : (
                          <div
                            style={{
                              width: 36,
                              height: 48,

                              background: '#eee',

                              borderRadius: 6
                            }}
                          />
                        )}
                        <SugText>
                          <SugTitle>{b.title}</SugTitle>
                          <SugMeta>
                            {typeof b.author === 'string'
                              ? b.author
                              : b.author?.name}
                          </SugMeta>
                        </SugText>
                      </SugItem>
                    ))}
                  </SuggestBox>
                )}
              </MobileSearchForm>

              <Burger onClick={() => setMenuOpen(true)} aria-label='Abrir menú'>
                <FiMenu size={22} />
              </Burger>
            </MobileBar>
          </HeaderBottom>
        )}
      </HeaderShell>

      {/* phone overlay fuera del header */}
      {!isAuth && (
        <Overlay open={menuOpen}>
          <OverlayTopBar>
            <Logo to='/' onClick={() => setMenuOpen(false)}>
              KBook Store
            </Logo>
            <CloseIcon
              onClick={() => {
                setMenuOpen(false)
                setCatMobileOpen(false)
              }}
              aria-label='Cerrar menú'
            >
              <FiX size={26} />
            </CloseIcon>
          </OverlayTopBar>

          {!catMobileOpen ? (
            // menu principal para phone
            <OverlayNav>
              <OverlayLink to='/bestsellers' onClick={() => setMenuOpen(false)}>
                Más Vendidos
              </OverlayLink>
              <OverlayLink
                to='/new-arrivals'
                onClick={() => setMenuOpen(false)}
              >
                Nuevas Publicaciones
              </OverlayLink>
              <OverlayRowBtn onClick={() => setCatMobileOpen(true)}>
                Categorías <FiChevronRight />
              </OverlayRowBtn>
              <OverlayLink to='/authors' onClick={() => setMenuOpen(false)}>
                Autores
              </OverlayLink>
              <OverlayLink to='/reviews' onClick={() => setMenuOpen(false)}>
                Reseñas
              </OverlayLink>
              <OverlayLink to='/contact' onClick={() => setMenuOpen(false)}>
                Contáctenos
              </OverlayLink>

              <OverlayLink to='/inbox' onClick={() => setMenuOpen(false)}>
                Bandeja de entrada
              </OverlayLink>

              {token ? (
                <OverlayRowBtn
                  onClick={() => {
                    logout()
                    setMenuOpen(false)
                    navigate('/')
                  }}
                >
                  <FiLogOut /> Cerrar sesión
                </OverlayRowBtn>
              ) : (
                <OverlayLink to='/login' onClick={() => setMenuOpen(false)}>
                  Iniciar Sesión
                </OverlayLink>
              )}
            </OverlayNav>
          ) : (
            // /////////////////// subpanel para categorias
            <CatPanel>
              <BackRow onClick={() => setCatMobileOpen(false)}>
                <FiChevronLeft /> Categorías
              </BackRow>
              {categories.map((cat) => (
                <OverlayLink
                  key={cat}
                  to={`/categories/${encodeURIComponent(cat)}`}
                  onClick={() => {
                    setMenuOpen(false)
                    setCatMobileOpen(false)
                  }}
                >
                  {cat}
                </OverlayLink>
              ))}
            </CatPanel>
          )}
        </Overlay>
      )}
    </>
  )
}
