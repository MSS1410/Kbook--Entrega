import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import api from '../../api'
import CartItem from '../../components/CartItem'
import { useNavigate, Link } from 'react-router-dom'

const Container = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  padding: ${({ theme }) => theme.spacing.lg};
`

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const Summary = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surfaceVariant};
  border-radius: ${({ theme }) => theme.radii.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`

const Total = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
`

const CheckoutButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border: none;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  flex: 1;
  min-width: 200px;
`

export default function CartPage() {
  const [cart, setCart] = useState(null)
  const navigate = useNavigate()

  const loadCart = async () => {
    try {
      const res = await api.get('/api/cart')
      setCart(res.data)
      console.log('Cart loaded:', res.data)
    } catch (err) {
      console.error('Error loading cart:', err)
    }
  }

  useEffect(() => {
    loadCart()
  }, [])

  const handleQuantityChange = async (item, qty) => {
    if (qty < 1) return
    try {
      await api.post('/api/cart', {
        bookId: item.book._id,
        format: item.format,
        quantity: qty
      })
      await loadCart()
    } catch (e) {
      console.error(e)
    }
  }

  const handleRemove = async (item) => {
    try {
      await api.delete('/api/cart', {
        data: { bookId: item.book._id, format: item.format }
      })
      await loadCart()
    } catch (e) {
      console.error(e)
    }
  }

  const computeTotal = () => {
    if (!cart) return 0
    return cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0)
  }

  if (!cart) return <p>Cargando carrito...</p>

  return (
    <Container>
      <Title>Tu carrito</Title>
      {cart.items.length === 0 ? (
        <p>
          Tu carrito está vacío. <Link to='/books'>Comprar libros</Link>
        </p>
      ) : (
        <>
          {cart.items.map((it) => (
            <CartItem
              key={`${it.book._id}-${it.format}`}
              item={it}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemove}
            />
          ))}

          <Summary>
            <Total>Total: {computeTotal().toFixed(2)} €</Total>
            <CheckoutButton onClick={() => navigate('/checkout')}>
              Ir a pagar
            </CheckoutButton>
          </Summary>
        </>
      )}
    </Container>
  )
}
