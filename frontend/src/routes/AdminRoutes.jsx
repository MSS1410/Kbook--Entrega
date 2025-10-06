import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Layout (también lazy)
const AdminLayout = lazy(() =>
  import('../features/admin/layout/AdminLayout.jsx')
)

// Páginas admin (ajusta paths si cambian)
const AdminHome = lazy(() => import('../features/admin/pages/AdminHome.jsx'))
const AdminBooks = lazy(() =>
  import('../features/admin/pages/books/AdminBooks.jsx')
)
const AdminBookDetail = lazy(() =>
  import('../features/admin/pages/books/AdminBookDetail.jsx')
)
const AdminAuthors = lazy(() =>
  import('../features/admin/pages/authors/AdminAuthors.jsx')
)
const AdminAuthorDetail = lazy(() =>
  import('../features/admin/pages/authors/AdminAuthorDetail.jsx')
)
const AdminUsers = lazy(() =>
  import('../features/admin/pages/users/AdminUsers.jsx')
)
const AdminUserDetail = lazy(() =>
  import('../features/admin/pages/users/AdminUserDetail.jsx')
)
const AdminOrders = lazy(() =>
  import('../features/admin/pages/orders/AdminOrders.jsx')
)
const AdminOrdersList = lazy(() =>
  import('../features/admin/pages/orders/AdminOrdersList.jsx')
)
const AdminReviews = lazy(() =>
  import('../features/admin/pages/reviews/AdminReviews.jsx')
)
const AdminReviewsList = lazy(() =>
  import('../features/admin/pages/reviews/AdminReviewsList.jsx')
)
const AdminContact = lazy(() =>
  import('../features/admin/pages/contact/AdminContact.jsx')
)
const AdminMyProfile = lazy(() =>
  import('../features/admin/pages/AdminProfile.jsx')
)

export default function AdminRoutes() {
  return (
    <Suspense fallback={<div>Cargando área de administración…</div>}>
      <Routes>
        {/* Todas las rutas admin comparten el mismo layout */}
        <Route element={<AdminLayout />}>
          <Route index element={<AdminHome />} />

          {/* Profile */}
          <Route path='profile' element={<AdminMyProfile />} />

          {/* Libros */}
          <Route path='books' element={<AdminBooks />} />
          <Route path='books/:id' element={<AdminBookDetail />} />

          {/* Autores */}
          <Route path='authors' element={<AdminAuthors />} />
          <Route path='authors/:id' element={<AdminAuthorDetail />} />

          {/* Usuarios */}
          <Route path='users' element={<AdminUsers />} />
          <Route path='users/:id' element={<AdminUserDetail />} />

          {/* Pedidos */}
          <Route path='orders' element={<AdminOrders />} />
          <Route path='orders/list' element={<AdminOrdersList />} />

          {/* Reviews */}
          <Route path='reviews' element={<AdminReviews />} />
          <Route path='reviews/list' element={<AdminReviewsList />} />

          {/* Contacto */}
          <Route path='contact' element={<AdminContact />} />

          {/* Fallback dentro de /admin */}
          <Route path='*' element={<Navigate to='/admin' replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
