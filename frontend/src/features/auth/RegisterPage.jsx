// Reutilizamos el formulario dinámico arrancando en modo "register"
import React from 'react'
import LoginPage from './LoginPage'

export default function RegisterPage() {
  return <LoginPage initialMode='register' />
}
