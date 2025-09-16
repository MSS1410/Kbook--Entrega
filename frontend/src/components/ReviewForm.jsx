// frontend/src/components/ReviewForm.jsx
import React, { useState } from 'react'
import styled from 'styled-components'
import useAuth from '../hooks/useAuth'
import api from '../api/index'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  z-index: 2000;
`
const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  max-width: 600px;
  width: 100%;
  position: relative;
`
const Title = styled.h2`
  margin-top: 0;
`
const Textarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ hasError }) => (hasError ? 'red' : '#ccc')};
  border-radius: ${({ theme }) => theme.radii.sm};
  resize: vertical;
`
const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`
const Input = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ hasError }) => (hasError ? 'red' : '#ccc')};
`
const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.md};
`
const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border: none;
  padding: ${({ theme }) => theme.spacing.sm} 1rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
`
const Close = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
`

export default function ReviewForm({ book, onClose, prefill = {} }) {
  const { user } = useAuth()
  const [comment, setComment] = useState(prefill.comment || '')
  const [rating, setRating] = useState(prefill.rating || 5)
  const [error, setError] = useState(null)
  const maxWords = 250

  const wordCount = comment.trim() ? comment.trim().split(/\s+/).length : 0
  const isTooLong = wordCount > maxWords

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError('Comentario obligatorio')
      return
    }
    if (isTooLong) {
      setError(`Máximo ${maxWords} palabras (lleva ${wordCount})`)
      return
    }
    try {
      await api.post('/api/reviews', {
        book: book._id,
        rating,
        comment
      })
      alert('Gracias por tu reseña')
      onClose()
    } catch (e) {
      console.error(e)
      alert('Error enviando reseña')
    }
  }

  return (
    <Overlay>
      <Card>
        <Close onClick={onClose}>✕</Close>
        <Title>Deja tu huella en “{book.title}”</Title>
        <div style={{ marginBottom: 8 }}>
          <label>
            Calificación:{' '}
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} ⭐
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Comentario (máx {maxWords} palabras):
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              hasError={!!error}
            />
          </label>
          <div style={{ fontSize: '0.85rem', marginTop: 4 }}>
            {wordCount} / {maxWords} palabras
          </div>
          {error && <div style={{ color: 'red', marginTop: 4 }}>{error}</div>}
        </div>
        <Footer>
          <div></div>
          <Button onClick={handleSubmit} disabled={isTooLong}>
            Enviar reseña
          </Button>
        </Footer>
      </Card>
    </Overlay>
  )
}
