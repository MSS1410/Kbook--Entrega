import React, { createContext, useState, useEffect, useContext } from 'react'
import api from '../api/index'

// Helpers ----------------------------------------
export const getStoredUser = () => {
  try {
    const raw = sessionStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Context ----------------------------------------
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('token'))
  const [user, setUser] = useState(() => getStoredUser())

  // Sincroniza token con axios y storage
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      sessionStorage.setItem('token', token)
    } else {
      delete api.defaults.headers.common['Authorization']
      sessionStorage.removeItem('token')
    }
  }, [token])

  // Sincroniza user con storage
  useEffect(() => {
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user))
    } else {
      sessionStorage.removeItem('user')
    }
  }, [user])

  // ✅ Devuelve el usuario para que el caller decida adónde navegar
  const login = async ({ email, password }) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  const register = async ({ name, email, password }) => {
    const { data } = await api.post('/api/auth/register', {
      name,
      email,
      password
    })
    setToken(data.token)
    setUser(data.user)
    return data.user
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
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
