import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Layout lazy also
const AdminLayout = lazy(() =>
  import('../features/admin/layout/AdminLayout.jsx')
)

// admin Pages
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
        {/* mismo layout shared para todas las rutas */}
        <Route element={<AdminLayout />}>
          <Route index element={<AdminHome />} />

          {/* profile */}
          <Route path='profile' element={<AdminMyProfile />} />

          {/* books */}
          <Route path='books' element={<AdminBooks />} />
          <Route path='books/:id' element={<AdminBookDetail />} />

          {/* autores */}
          <Route path='authors' element={<AdminAuthors />} />
          <Route path='authors/:id' element={<AdminAuthorDetail />} />

          {/* usdrs */}
          <Route path='users' element={<AdminUsers />} />
          <Route path='users/:id' element={<AdminUserDetail />} />

          {/* orders pedidos */}
          <Route path='orders' element={<AdminOrders />} />
          <Route path='orders/list' element={<AdminOrdersList />} />

          {/* reviews */}
          <Route path='reviews' element={<AdminReviews />} />
          <Route path='reviews/list' element={<AdminReviewsList />} />

          {/* contact inbox */}
          <Route path='contact' element={<AdminContact />} />

          {/* salve dentro de admin */}
          <Route path='*' element={<Navigate to='/admin' replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
