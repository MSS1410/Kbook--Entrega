import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Books from './pages/Books'

// Puedes añadir después Authors, Reviews, Users...
const NotFound = () => <div>404</div>

export default function AdminApp() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path='books' element={<Books />} />
        <Route path='orders' element={<Orders />} />
        {/* TODO: <Route path='authors' .../> <Route path='reviews' .../> <Route path='users' .../> */}
        <Route path='*' element={<NotFound />} />
      </Route>
    </Routes>
  )
}
