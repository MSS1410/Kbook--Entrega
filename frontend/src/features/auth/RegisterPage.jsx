import React from 'react'
import LoginPage from './LoginPage'
// reutilizo formulario arrancando en modo register
export default function RegisterPage() {
  return <LoginPage initialMode='register' />
}
