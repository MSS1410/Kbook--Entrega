// frontend/src/components/CartAside.jsx
import React from 'react'
import styled, { keyframes } from 'styled-components'
import { FiTrash2, FiMinus, FiPlus, FiX, FiChevronLeft } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import useCart from '../../hooks/useCart'

const Aside = styled.aside`
  position: fixed;
  top: 0;
  right: 0;
  width: 360px;
  max-width: 100%;
  height: 100%;
  background: #fff;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.md};
  z-index: 951;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const Title = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.lg};
`

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
`

const ItemsWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const ItemCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.onSurfaceVariant};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  position: relative;
`

const Cover = styled.img`
  width: 60px;
  height: 90px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.sm};
  flex-shrink: 0;
  background: #f0f0f0;
`

const Info = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`

const BookTitle = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
`

const FormatLabel = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  margin-bottom: 8px;
`

const QuantityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
`

const QtyButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.onSurfaceVariant};
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  cursor: pointer;
`

const Trash = styled.button`
  background: none;
  border: none;
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
`

const Bottom = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.onSurfaceVariant};
  padding-top: ${({ theme }) => theme.spacing.md};
  position: sticky;
  bottom: 0;
  background: #fff;
  z-index: 5;
`

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const CheckoutButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.md};
  cursor: pointer;
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const Empty = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`
// --- Spinner ---
const spin = keyframes`
  to { transform: rotate(360deg); }
`

const Spinner = styled.div`
  width: 28px;
  height: 28px;
  border: 3px solid #e6e6e6;
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  margin: 0 auto 8px;
`

const LoadingBox = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`

export default function CarritoAside({ onClose }) {
  const navigate = useNavigate()
  const { cart, addOrUpdate, removeItem, loading } = useCart()

  const subtotal = cart.items.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  )

  const handleQuantityChange = (item, delta) => {
    const newQty = Math.max(1, item.quantity + delta)
    addOrUpdate({
      bookId: item.book._id,
      format: item.format,
      quantity: newQty
    })
  }

  const handleRemove = (item) => {
    removeItem({ bookId: item.book._id, format: item.format })
  }

  const handleCheckout = () => {
    if (cart.items.length === 0) return
    window.dispatchEvent(new Event('cart:close'))
    navigate('/checkout')
  }

  return (
    <Aside>
      <Header>
        <Title>Tu carrito</Title>
        <CloseBtn onClick={onClose} aria-label='Cerrar carrito'>
          <FiChevronLeft />
        </CloseBtn>
      </Header>

      <ItemsWrapper>
        {loading ? (
          <LoadingBox>
            <Spinner />
            Cargando carrito…
          </LoadingBox>
        ) : !cart?.items || cart.items.length === 0 ? (
          <Empty>No hay productos en el carrito</Empty>
        ) : (
          cart.items.map((it) => (
            <ItemCard key={`${it.book._id}-${it.format}`}>
              <Cover src={it.book.coverImage} alt={it.book.title} />
              <Info>
                <BookTitle>{it.book.title}</BookTitle>
                <FormatLabel>{it.label}</FormatLabel>
                <QuantityRow>
                  <QtyButton
                    aria-label='disminuir'
                    onClick={() => handleQuantityChange(it, -1)}
                    disabled={it.quantity <= 1}
                  >
                    <FiMinus />
                  </QtyButton>
                  <div>{it.quantity}</div>
                  <QtyButton
                    aria-label='aumentar'
                    onClick={() => handleQuantityChange(it, +1)}
                  >
                    <FiPlus />
                  </QtyButton>
                  <div style={{ marginLeft: 'auto' }}>
                    {(it.price * it.quantity).toFixed(2)} €
                  </div>
                </QuantityRow>
              </Info>
              <Trash onClick={() => handleRemove(it)} aria-label='eliminar'>
                <FiTrash2 />
              </Trash>
            </ItemCard>
          ))
        )}
      </ItemsWrapper>

      <Bottom>
        <TotalRow>
          <div>Subtotal</div>
          <div>{subtotal.toFixed(2)} €</div>
        </TotalRow>
        <CheckoutButton
          onClick={handleCheckout}
          disabled={cart.items.length === 0}
          aria-label='Continuar con la compra'
        >
          Continuar con la compra
        </CheckoutButton>
      </Bottom>
    </Aside>
  )
}
