import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import useAuth from '../../hooks/useAuth'

/* ===== Estilos ===== */
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
  padding: ${({ theme }) => theme.spacing.lg};
`
const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  width: 100%;
  max-width: 980px;
  overflow: hidden;
`
const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`
const Left = styled.div`
  padding: clamp(20px, 5vw, 44px);
`
const Right = styled.div`
  padding: clamp(20px, 5vw, 44px);
  background: ${({ theme }) => theme.colors.mutedSurface};
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  @media (max-width: 900px) {
    border-left: none;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }
`
const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`
const Sub = styled.p`
  color: ${({ theme }) => theme.colors.mutedText};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`
const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`
const Field = styled.div`
  display: grid;
  gap: 6px;
`
const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
`
const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.base};
`
const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
`
const Primary = styled.button`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.base};
  min-width: 160px;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
`
const Ghost = styled.button`
  padding: ${({ theme }) => theme.spacing.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.accent};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.base};
  min-width: 160px;
`
const ErrorText = styled.div`
  color: #dc2626;
  font-size: 0.9rem;
`
const Hint = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.mutedText};
  margin-top: -4px;
`

/* ===== Utiles locales ===== */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode) // 'login' | 'register'
  const isLogin = mode === 'login'
  const navigate = useNavigate()
  const { login, register } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Campos compartidos
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Solo registro
  const [name, setName] = useState('')
  const [confirm, setConfirm] = useState('')

  const canSubmit = useMemo(() => {
    if (loading) return false
    if (isLogin) {
      return emailRegex.test(email) && password.length >= 6
    }
    // register
    return (
      name.trim().length >= 2 &&
      emailRegex.test(email) &&
      password.length >= 6 &&
      confirm === password
    )
  }, [isLogin, email, password, name, confirm, loading])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    setLoading(true)
    try {
      if (isLogin) {
        const user = await login({ email: email.trim(), password })
        if (user?.role === 'admin' || user?.isAdmin) navigate('/admin')
        else navigate('/')
      } else {
        await register({ name: name.trim(), email: email.trim(), password })
        // Mostrar aviso en ProfilePage
        try {
          sessionStorage.setItem('kbook:justRegistered', '1')
        } catch {}
        navigate('/profile')
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          (isLogin ? 'Error al iniciar sesión' : 'Error en el registro')
      )
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setError(null)
    setMode((m) => (m === 'login' ? 'register' : 'login'))
  }

  return (
    <Container>
      <Card>
        <TwoCol>
          {/* IZQ: formulario dinámico */}
          <Left>
            <Title>{isLogin ? 'Iniciar sesión' : 'Crear cuenta'}</Title>
            <Sub>
              {isLogin
                ? 'Accede para continuar con tus lecturas.'
                : 'Únete a Kbook y empieza tu biblioteca.'}
            </Sub>

            <Form onSubmit={handleSubmit} noValidate>
              {!isLogin && (
                <Field>
                  <Label htmlFor='name'>Nombre</Label>
                  <Input
                    id='name'
                    type='text'
                    placeholder='Tu nombre'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    autoComplete='name'
                  />
                </Field>
              )}

              <Field>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='tucorreo@ejemplo.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete='email'
                />
                {!emailRegex.test(email) && email.length > 0 && (
                  <Hint>Introduce un email válido.</Hint>
                )}
              </Field>

              <Field>
                <Label htmlFor='password'>Contraseña</Label>
                <Input
                  id='password'
                  type='password'
                  placeholder='••••••'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                {password.length > 0 && password.length < 6 && (
                  <Hint>Mínimo 6 caracteres.</Hint>
                )}
              </Field>

              {!isLogin && (
                <Field>
                  <Label htmlFor='confirm'>Confirmar contraseña</Label>
                  <Input
                    id='confirm'
                    type='password'
                    placeholder='Repite la contraseña'
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={6}
                    autoComplete='new-password'
                  />
                  {confirm && confirm !== password && (
                    <Hint>Las contraseñas no coinciden.</Hint>
                  )}
                </Field>
              )}

              {error && <ErrorText role='alert'>{error}</ErrorText>}

              <Row>
                <Primary type='submit' disabled={!canSubmit}>
                  {loading
                    ? 'Procesando…'
                    : isLogin
                    ? 'Ingresar'
                    : 'Registrarse'}
                </Primary>
              </Row>
            </Form>
          </Left>

          {/* DER: CTA que alterna el modo */}
          <Right>
            <h3 style={{ margin: 0 }}>
              {isLogin ? '¿Aún no tienes cuenta?' : '¿Ya tienes cuenta?'}
            </h3>
            <p style={{ margin: 0 }}>
              {isLogin
                ? 'Crea una cuenta para guardar tu dirección y métodos de pago.'
                : 'Inicia sesión con tus credenciales para continuar.'}
            </p>
            <div style={{ height: 8 }} />
            <Ghost type='button' onClick={toggleMode}>
              {isLogin ? 'Únete a Kbook' : 'Iniciar sesión'}
            </Ghost>
          </Right>
        </TwoCol>
      </Card>
    </Container>
  )
}
