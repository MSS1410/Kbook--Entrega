import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'

import { ThemeProvider } from 'styled-components'
import GlobalStyles from './styles/GlobalStyles'
import theme from './styles/theme'
import Layout from './components/Layout'

import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'

import HomePage from './features/Home/HomePage'
import ProfilePage from './features/pages/ProfilePage'
import BestSellerPage from './features/pages/BestSellerPage'
import NewArrivalsPage from './features/pages/newArrivalsPage'

import AuthorsPage from './features/pages/AuthorsPage'

import ReviewsPage from './features/pages/ReviewsPage'

import CategoryPage from './features/pages/CategoryPage'

import BooksPage from './features/Books/BooksPage'
import BookSingularPage from './features/Books/BookSingularPage'
import MyBooksPage from './features/pages/MisLibrosPage'
import CartPage from './features/cart/CartPage'
import CheckoutPage from './features/pages/CheckOutPage'
import OrderConfirm from './features/pages/OrderConfirm'

import useAuth, { AuthProvider } from './hooks/useAuth'

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
          <Layout>
            <Routes>
              {/* Home */}
              <Route path='/' element={<HomePage />} />
              {/* Secciones públicas */}{' '}
              <Route path='/profile' element={<ProfilePage />} />
              <Route path='/books' element={<BooksPage />} />
              <Route path='/books/:id' element={<BookSingularPage />} />
              <Route path='/bestsellers' element={<BestSellerPage />} />
              <Route path='/new-arrivals' element={<NewArrivalsPage />} />
              <Route path='/authors' element={<AuthorsPage />} />
              <Route path='/categories/:category' element={<CategoryPage />} />
              <Route path='/reviews' element={<ReviewsPage />} />
              <Route path='/cart' element={<CartPage />} />
              <Route path='/checkout' element={<CheckoutPage />} />
              <Route path='/order-confirm' element={<OrderConfirm />} />
              <Route path='/orders/:id' element={<OrderConfirm />} />
              {/* Autenticación */}
              <Route path='/login' element={<LoginPage />} />
              <Route path='/register' element={<RegisterPage />} />
              {/* Rutas protegidas */}
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
              {/* Redirección para rutas no definidas */}
              <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}
