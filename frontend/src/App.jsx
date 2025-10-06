import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import GlobalStyles from './styles/globalStyles.js'
import theme from './styles/theme'
import Layout from './components/layout/Layout.jsx'

import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'

import HomePage from './features/Home/HomePage'
import ProfilePage from './features/pages/profileSite/ProfilePage.jsx'
import BestSellerPage from './features/pages/bestSeller/BestSellerPage.jsx'
import NewArrivalsPage from './features/pages/newArrivals/newArrivalsPage.jsx'
import AuthorsPage from './features/pages/authors/AuthorsPage.jsx'
import AuthorDetailPage from './features/pages/authors/AuthorDetailPage.jsx'

import ReviewsPage from './features/pages/reviews/ReviewsPage.jsx'
import BookReviewsPage from './features/pages/reviews/BookReviewsPage.jsx'

import CategoryPage from './features/pages/cats/CategoryPage.jsx'
import BooksPage from './features/Books/BooksPage'
import BookSingularPage from './features/Books/BookSingularPage'
import MyBooksPage from './features/pages/books/MisLibrosPage.jsx'
import CartPage from './features/cart/CartPage'
import CheckoutPage from './features/pages/saleProcess/CheckOutPage.jsx'
import OrderConfirm from './features/pages/saleProcess/OrderConfirm.jsx'
import ContactPage from './features/pages/contact/Contact.jsx'
import useAuth, { AuthProvider } from './hooks/useAuth'
import AdminRoutes from './routes/AdminRoutes.jsx'
import AdminRoute from './routes/AdminRoute.jsx'

// 🚀 Bandeja de entrada de usuario
import InboxUser from './features/pages/message/InboxUser.jsx'

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to='/login' replace />
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Público/usuario con Layout */}
            <Route element={<Layout />}>
              <Route path='/' element={<HomePage />} />
              <Route path='/books' element={<BooksPage />} />
              <Route path='/books/:id' element={<BookSingularPage />} />
              <Route path='/bestsellers' element={<BestSellerPage />} />
              <Route path='/new-arrivals' element={<NewArrivalsPage />} />
              <Route path='/authors' element={<AuthorsPage />} />
              <Route path='/authors/:id' element={<AuthorDetailPage />} />
              <Route path='/categories/:category' element={<CategoryPage />} />
              <Route path='/reviews' element={<ReviewsPage />} />
              <Route path='/books/:id/reviews' element={<BookReviewsPage />} />
              <Route path='/contact' element={<ContactPage />} />

              <Route path='/checkout' element={<CheckoutPage />} />
              <Route path='/order-confirm' element={<OrderConfirm />} />
              <Route path='/orders/:id' element={<OrderConfirm />} />

              {/* Auth */}
              <Route path='/login' element={<LoginPage />} />
              <Route path='/register' element={<RegisterPage />} />

              {/* Protegidas user */}
              <Route
                path='/profile'
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/my-books'
                element={
                  <ProtectedRoute>
                    <MyBooksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/cart'
                element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                }
              />

              {/* 📥 Bandeja: lista y conversación */}
              <Route
                path='/inbox'
                element={
                  <ProtectedRoute>
                    <InboxUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/inbox/:threadId'
                element={
                  <ProtectedRoute>
                    <InboxUser />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Área Admin (rol) */}
            <Route
              path='/admin/*'
              element={
                <AdminRoute>
                  <AdminRoutes />
                </AdminRoute>
              }
            />

            {/* Fallback */}
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}
