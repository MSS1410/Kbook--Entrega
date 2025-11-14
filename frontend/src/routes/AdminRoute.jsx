import React, { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import useAuth, { getStoredUser } from '../hooks/useAuth'

export default function AdminRoute({ children }) { // wrapper protector
  const { user, token } = useAuth() // user de contexto y token si tiene

  // si el contexto no carga, leo de sessionStorage con getStoredUser
  const effectiveUser = useMemo(() => user || getStoredUser(), [user]) // evita parpadeo refresh
  const isAdmin =
    !!token && (effectiveUser?.role === 'admin' || effectiveUser?.isAdmin) // 2 checks

  return isAdmin ? children : <Navigate to='/' replace />
}


// guardia de ruta = PROTECTOR

// impide acceso a rutas admin si el usuario no es admin
