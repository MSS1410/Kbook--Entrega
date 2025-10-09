// frontend/src/features/Books/SingularBook/components/ReviewModal.jsx
import React from 'react'
import styled from 'styled-components'
import Modal from '../../../../../../components/modal/Modal'

const StarPicker = styled.div`
  display: inline-flex;
  gap: 6px;
  font-size: 22px;
  cursor: pointer;
  user-select: none;
`
const ReviewTextarea = styled.textarea`
  width: 100%;
  min-height: 110px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 10px 12px;
  resize: vertical;
`
const SmallMeta = styled.small`
  color: ${({ theme }) => theme.colors.mutedText};
`
const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: ${({ theme }) => theme.spacing.md};
`
const ModalButton = styled.button`
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid
    ${({ $ghost, theme }) => ($ghost ? theme.colors.primary : 'transparent')};
  background: ${({ $ghost, theme }) =>
    $ghost ? 'transparent' : theme.colors.primary};
  color: ${({ $ghost, theme }) =>
    $ghost ? theme.colors.primary : theme.colors.onPrimary};
  cursor: pointer;
`

export default function ReviewModal({
  open,
  onClose,
  rating,
  onRatingChange,
  comment,
  onCommentChange,
  wordCount,
  onSubmit,
  saving
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <h3 style={{ marginTop: 0 }}>Escribe una reseña</h3>
      <div style={{ marginBottom: 12 }}>Puntúa tu experiencia:</div>

      <StarPicker>
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            onClick={() => onRatingChange?.(n)}
            title={`${n} estrellas`}
            aria-label={`${n} estrellas`}
            style={{
              color: n <= rating ? '#f59e0b' : '#bbb',
              cursor: 'pointer'
            }}
          >
            ★
          </span>
        ))}
      </StarPicker>

      <div style={{ marginTop: 12 }}>
        <ReviewTextarea
          placeholder='Cuéntanos qué te ha parecido… (máx. 50 palabras)'
          value={comment}
          onChange={onCommentChange}
        />
        <SmallMeta>{wordCount} / 50 palabras</SmallMeta>
      </div>

      <ModalActions>
        <ModalButton $ghost type='button' onClick={onClose}>
          Cancelar
        </ModalButton>
        <ModalButton type='button' onClick={onSubmit} disabled={saving}>
          {saving ? 'Guardando…' : 'Publicar'}
        </ModalButton>
      </ModalActions>
    </Modal>
  )
}
