// frontend/src/hooks/useAuth.jsx
import React, { createContext, useState, useEffect, useContext } from 'react'
import api from '../api/index'

// Contexto
const AuthContext = createContext()

const safeParseUser = () => {
  try {
    const raw = sessionStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  // hidrata desde sessionStorage (cerrar pestaña = sesión fuera)
  const [token, setToken] = useState(() => sessionStorage.getItem('token'))
  const [user, setUser] = useState(() => safeParseUser())

  useEffect(() => {
    if (token) {
      // Si usas el interceptor que lee de sessionStorage, esto no es estrictamente necesario,
      // pero ayuda si haces llamadas manuales con api fuera del interceptor.
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      sessionStorage.setItem('token', token)
      if (user) {
        sessionStorage.setItem('user', JSON.stringify(user))
      }
    } else {
      delete api.defaults.headers.common['Authorization']
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
    }
  }, [token, user])

  const login = async ({ email, password }) => {
    const response = await api.post('/api/auth/login', { email, password })
    setToken(response.data.token)
    setUser(response.data.user)
    // No hace falta guardar aquí; el useEffect de arriba lo persiste en sessionStorage
  }

  const register = async ({ name, email, password }) => {
    const response = await api.post('/api/auth/register', {
      name,
      email,
      password
    })
    setToken(response.data.token)
    setUser(response.data.user)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ token, user, setUser, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
