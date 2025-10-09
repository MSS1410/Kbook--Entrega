import React, { useEffect, useState } from 'react'
import api from '../../../api/index'
import styled from 'styled-components'

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
`
const Item = styled.div`
  display: flex;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`
const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.onError};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
`

export default function CartPage() {
  const [cart, setCart] = useState(null)

  useEffect(() => {
    api
      .get('/api/cart')
      .then((res) => setCart(res.data))
      .catch((err) => console.error(err))
  }, [])

  if (!cart) return <p>Cargando carrito...</p>

  return (
    <Container>
      <h1>Mi Carrito</h1>
      {cart.items.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        cart.items.map((item) => (
          <Item key={item.book._id}>
            <span>
              {item.book.title} x {item.quantity}
            </span>
            <Button onClick={() => console.log('Eliminar', item.book._id)}>
              Eliminar
            </Button>
          </Item>
        ))
      )}
    </Container>
  )
}
