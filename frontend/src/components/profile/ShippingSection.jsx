import React, { useState } from 'react'
import styled from 'styled-components'
import useAuth from '../../hooks/useAuth'
import api from '../../api'
import { isValidPostal } from '../../utils/validators'

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
`
const SectionTitle = styled.h2`
  margin: 0 0 12px 0;
  color: ${({ theme }) => theme.colors?.primary || '#8b5cf6'};
`
const Row = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`
const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
`
const GhostButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
`
const Field = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`
const Label = styled.label`
  display: block;
  margin-bottom: 4px;
  font-weight: 700;
`
const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid #ccc;
  border-radius: ${({ theme }) => theme.radii.sm};
`
const ErrorText = styled.div`
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
`

export default function ShippingSection() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({
    address: user?.address || '',
    city: user?.city || '',
    postalCode: user?.postalCode || '',
    country: user?.country || 'ES'
  })
  const [edit, setEdit] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.address.trim()) e.address = 'Dirección obligatoria.'
    if (!form.city.trim()) e.city = 'Ciudad obligatoria.'
    if (!form.country.trim()) e.country = 'País obligatorio.'
    if (!isValidPostal(form.postalCode, form.country))
      e.postalCode = 'Código postal inválido.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async () => {
    if (!validate()) return
    try {
      const res = await api.put('/api/users/profile', { ...form })
      setUser(res.data.user)
      setEdit(false)
    } catch {
      alert('Error guardando dirección')
    }
  }

  return (
    <Card>
      <SectionTitle>Dirección de envío</SectionTitle>
      <Field>
        <Label>Dirección</Label>
        <Input
          value={form.address}
          disabled={!edit}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        />
        {errors.address && <ErrorText>{errors.address}</ErrorText>}
      </Field>
      <Field>
        <Label>Ciudad</Label>
        <Input
          value={form.city}
          disabled={!edit}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
        />
        {errors.city && <ErrorText>{errors.city}</ErrorText>}
      </Field>
      <Field>
        <Label>Código postal</Label>
        <Input
          value={form.postalCode}
          disabled={!edit}
          onChange={(e) =>
            setForm((f) => ({ ...f, postalCode: e.target.value }))
          }
        />
        {errors.postalCode && <ErrorText>{errors.postalCode}</ErrorText>}
      </Field>
      <Field>
        <Label>País</Label>
        <Input
          value={form.country}
          disabled={!edit}
          onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
        />
        {errors.country && <ErrorText>{errors.country}</ErrorText>}
      </Field>

      <Row>
        {!edit ? (
          <Button type='button' onClick={() => setEdit(true)}>
            Editar
          </Button>
        ) : (
          <>
            <Button type='button' onClick={save}>
              Guardar
            </Button>
            <GhostButton
              type='button'
              onClick={() => {
                setForm({
                  address: user?.address || '',
                  city: user?.city || '',
                  postalCode: user?.postalCode || '',
                  country: user?.country || 'ES'
                })
                setErrors({})
                setEdit(false)
              }}
            >
              Cancelar
            </GhostButton>
          </>
        )}
      </Row>
    </Card>
  )
}
