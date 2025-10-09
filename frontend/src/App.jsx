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

import HomePage from './features/user/Home/HomePage.jsx'
import ProfilePage from './features/user/Sites/profileSite/ProfilePage.jsx'
import BestSellerPage from './features/user/booksBy/bestSeller/BestSellerPage.jsx'
import NewArrivalsPage from './features/user/booksBy/newArrivals/newArrivalsPage.jsx'

import AuthorsPage from './features/user/Sites/author/AuthorsPage.jsx'
import AuthorDetailPage from './features/user/Sites/author/AuthorDetailPage.jsx'

import ReviewsPage from './features/user/Sites/reviews/ReviewsPage/ReviewsPage.jsx'
import BookReviewsPage from './features/user/Sites/reviews/BookReviewsPage.jsx'

import CategoryPage from './features/user/booksBy/cats/CategoryPage.jsx'
import BooksPage from './features/user/Sites/Books/PageBooks/BooksPage.jsx'
import BookSingularPage from './features/user/Sites/Books/SingularBook/BookSingularPage.jsx'
import MyBooksPage from './features/user/Sites/profileSite/MisLibrosPage.jsx'
import CartPage from './features/user/cart/CartPage'
import CheckoutPage from './features/user/Sites/saleProcess/checkoutPage/CheckOutPage.jsx'
import OrderConfirm from './features/user/Sites/saleProcess/OrderConfirm/OrderConfirm.jsx'
import ContactPage from './features/user/Sites/contact/Contact.jsx'
import useAuth, { AuthProvider } from './hooks/useAuth'
import AdminRoutes from './routes/AdminRoutes.jsx'
import AdminRoute from './routes/AdminRoute.jsx'

// 🚀 Bandeja de entrada de usuario
import InboxUser from './features/user/Sites/message/InboxUser.jsx'

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
