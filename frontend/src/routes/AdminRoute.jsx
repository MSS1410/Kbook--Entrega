import React, { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import useAuth, { getStoredUser } from '../hooks/useAuth'

export default function AdminRoute({ children }) {
  const { user, token } = useAuth()

  // Fallback: si user aún no está en contexto, lee de sessionStorage
  const effectiveUser = useMemo(() => user || getStoredUser(), [user])
  const isAdmin =
    !!token && (effectiveUser?.role === 'admin' || effectiveUser?.isAdmin)

  return isAdmin ? children : <Navigate to='/' replace />
}
