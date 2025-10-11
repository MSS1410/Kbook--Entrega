import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import Button from '../../Button.jsx'
import { Eye, Trash2 } from 'lucide-react'
//grid
const Card = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  overflow: hidden;
`
const Avatar = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #eee;
  flex: 0 0 auto;
  &::before {
    content: '';
    display: block;
    padding-bottom: 100%;
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
// cudro foto a 1:1
const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  flex: 1 1 auto;
`
const Name = styled.h3`
  font-size: 15px;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: calc(1.25em * 2);
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
`

export default function AuthorCard({ a, onDelete }) {
  return (
    <Card>
      <Avatar>{a.photo ? <img src={a.photo} alt={a.name} /> : null}</Avatar>
      {/* placeholder gris pero nunca deberia mostrarse :) */}
      <CardBody>
        <Name title={a.name}>{a.name}</Name>
        <Actions>
          <Button as={Link} $variant='ghost' to={`/admin/authors/${a._id}`}>
            <Eye size={16} /> Ver detalle
          </Button>
          <Button $variant='danger' onClick={() => onDelete(a._id)}>
            <Trash2 size={16} /> Eliminar
          </Button>
        </Actions>
      </CardBody>
    </Card>
  )
}
