import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import Button from '../../Button.jsx'
import { Eye, Trash2, Image as ImageIcon } from 'lucide-react'
import { absUrl } from '../../../../../utils/absUrl.js'

const Card = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  overflow: hidden;
  min-width: 0; /* ← evita desbordes en grid estrechos */
`
const Cover = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #eee;
  flex: 0 0 auto;
  &::before {
    content: '';
    display: block;
    padding-bottom: 133.333%;
  }
  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`
const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  flex: 1 1 auto;
  min-width: 0;
`
const Info = styled.div`
  display: grid;
  gap: 6px;
  min-height: calc((1.25em * 2) + 1em + 6px);
`
const Title = styled.h3`
  font-size: 15px;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: calc(1.25em * 2);
  margin: 0;
`
const Meta = styled.small`
  color: ${({ theme }) => theme.colors.mutedText};
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 1em;
`
const Actions = styled.div`
  margin-top: auto;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  a,
  button {
    font-size: 13px;
  }
  @media (max-width: 480px) {
    gap: 6px;
    a,
    button {
      flex: 1 1 auto;
    } /* ← en móviles, botones se adaptan y no rompen */
  }
`

export default function BookCard({ b, onDelete }) {
  return (
    <Card>
      <Cover>
        {b.coverImage ? (
          <img src={absUrl(b.coverImage)} alt={b.title} />
        ) : (
          // uso absUrl para evitar que se rompa el path
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              color: '#94a3b8',
              fontSize: 12
            }}
          >
            <ImageIcon size={24} />
          </div>
        )}
      </Cover>
      <CardBody>
        <Info>
          <Title title={b.title}>{b.title}</Title>
          <Meta>{b.category}</Meta>
        </Info>
        <Actions>
          <Button as={Link} $variant='ghost' to={`/admin/books/${b._id}`}>
            <Eye size={16} /> Ver detalle
          </Button>
          <Button $variant='danger' onClick={() => onDelete(b._id)}>
            <Trash2 size={16} /> Eliminar
          </Button>
        </Actions>
      </CardBody>
    </Card>
  )
}
