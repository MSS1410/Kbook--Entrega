// frontend/src/features/admin/pages/AdminUserDetail.jsx
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import {
  listAllUsersAdmin,
  toggleUserBlockAdmin,
  updateUserRoleAdmin,
  listOrders,
  listReviews,
  adminSendMessageToUser,
  deleteUserAdmin,
  deleteReview // 👈 IMPORTANTE
} from '../../api/adminApi.js'
import { Lock, Unlock, Save, Trash2 } from 'lucide-react' // 👈 usamos Trash2

const Wrap = styled.div`
  display: grid;
  gap: 16px;
`
const Top = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr);
  @media (min-width: 900px) {
    grid-template-columns: 260px minmax(0, 1fr);
  }
`
const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBg};
  overflow: hidden;
`
const Block = styled(Card)`
  padding: 16px;
  display: grid;
  gap: 10px;
`
const Avatar = styled.div`
  position: relative;
  width: 100%;
  background: #eee;
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
const Field = styled.div`
  display: grid;
  gap: 6px;
`
const Label = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
`
const TableWrap = styled.div`
  max-height: 420px;
  overflow: auto;
  border-radius: 10px;
`
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  th,
  td {
    padding: 10px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    text-align: left;
  }
  th {
    color: ${({ theme }) => theme.colors.mutedText};
    font-weight: 600;
    position: sticky;
    top: 0;
    background: ${({ theme }) => theme.colors.cardBg};
    z-index: 1;
  }
`

export default function AdminUserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [role, setRole] = useState('user')
  const [deleting, setDeleting] = useState(false)

  const [orders, setOrders] = useState([])
  const [ordersTotal, setOrdersTotal] = useState(0)

  const [reviews, setReviews] = useState([])
  const [reviewsTotal, setReviewsTotal] = useState(0)

  const [blocking, setBlocking] = useState(false)
  const [savingRole, setSavingRole] = useState(false)

  const [message, setMessage] = useState({ subject: '', body: '' })

  const [deletingReviewIds, setDeletingReviewIds] = useState(new Set())

  const sameId = (a, b) => String(a || '').trim() === String(b || '').trim()

  useEffect(() => {
    let alive = true
    ;(async () => {
      const all = await listAllUsersAdmin()
      const u = all.find((x) => sameId(x._id, id))
      if (!alive) return
      setUser(u || null)
      setRole(u?.role || 'user')

      try {
        const resOrders = await listOrders({ page: 1, limit: 500, userId: id })
        const arr = Array.isArray(resOrders?.orders) ? resOrders.orders : []
        const filtered = arr.filter((o) => {
          const uu = o.user
          const uid = typeof uu === 'object' ? uu?._id || uu?.id : uu
          return sameId(uid, id)
        })
        if (!alive) return
        setOrders(filtered)
        setOrdersTotal(filtered.length)
      } catch {
        if (!alive) return
        setOrders([])
        setOrdersTotal(0)
      }

      try {
        const resReviews = await listReviews({
          page: 1,
          limit: 500,
          userId: id,
          order: 'desc'
        })
        const arr = Array.isArray(resReviews?.reviews) ? resReviews.reviews : []
        const filtered = arr.filter((r) => {
          const uu = r.user
          const uid = typeof uu === 'object' ? uu?._id || uu?.id : uu
          return sameId(uid, id)
        })
        if (!alive) return
        setReviews(filtered)
        setReviewsTotal(filtered.length)
      } catch {
        if (!alive) return
        setReviews([])
        setReviewsTotal(0)
      }
    })()
    return () => {
      alive = false
    }
  }, [id])

  const totalSpent = useMemo(
    () => orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0),
    [orders]
  )

  const toggleBlock = async () => {
    if (!user) return
    setBlocking(true)
    try {
      const nextBlocked = !user.isBlocked
      await toggleUserBlockAdmin(user._id, nextBlocked)
      setUser((u) => (u ? { ...u, isBlocked: nextBlocked } : u))
    } finally {
      setBlocking(false)
    }
  }

  const onDelete = async () => {
    if (!user) return
    if (
      !confirm(
        `¿Eliminar la cuenta de "${user.name}"? Esta acción no se puede deshacer.`
      )
    )
      return
    try {
      setDeleting(true)
      await deleteUserAdmin(user._id)
      alert('Usuario eliminado.')
      navigate('/admin/users')
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        'No se pudo eliminar el usuario (posible restricción: no puedes borrarte a ti mismo o al último admin).'
      alert(msg)
    } finally {
      setDeleting(false)
    }
  }

  const saveRole = async () => {
    if (!user) return
    setSavingRole(true)
    try {
      await updateUserRoleAdmin(user._id, role)
      setUser((u) => (u ? { ...u, role } : u))
    } finally {
      setSavingRole(false)
    }
  }

  if (!user) {
    return <div style={{ padding: 16 }}>Cargando…</div>
  }

  return (
    <Wrap>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h2 style={{ fontSize: 22 }}>Perfil de usuario</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            $variant={user.isBlocked ? 'primary' : 'danger'}
            onClick={toggleBlock}
            disabled={blocking}
          >
            {user.isBlocked ? <Unlock size={16} /> : <Lock size={16} />}
            {user.isBlocked ? ' Desbloquear' : ' Bloquear'}
          </Button>
          <Button $variant='danger' onClick={onDelete} disabled={deleting}>
            <Trash2 size={16} /> {deleting ? ' Eliminando…' : ' Eliminar'}
          </Button>
        </div>
      </div>

      <Top>
        <Card>
          <Avatar>
            {user.avatar ? <img src={user.avatar} alt={user.name} /> : null}
          </Avatar>
        </Card>

        <Block>
          <Field>
            <Label>Nombre</Label>
            <div>{user.name || '—'}</div>
          </Field>
          <Field>
            <Label>Email</Label>
            <div>{user.email || '—'}</div>
          </Field>
          <Field>
            <Label>Descripción</Label>
            <div>{user.description || '—'}</div>
          </Field>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
              gap: 8
            }}
          >
            <Field>
              <Label>Rol</Label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    padding: '10px',
                    border: '1px solid var(--border,#E2E8F0)',
                    borderRadius: 10
                  }}
                >
                  <option value='user'>user</option>
                  <option value='admin'>admin</option>
                </select>
                <Button onClick={saveRole} disabled={savingRole}>
                  <Save size={16} /> Guardar
                </Button>
              </div>
            </Field>

            <Field>
              <Label>Registrado</Label>
              <div>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleString()
                  : '—'}
              </div>
            </Field>

            <Field>
              <Label>Última conexión</Label>
              <div>
                {user.lastLogin
                  ? new Date(user.lastLogin).toLocaleString()
                  : '—'}
              </div>
            </Field>
          </div>
        </Block>
      </Top>

      <Block>
        <strong>
          Compras ({ordersTotal}) — Total gastado:{' '}
          {totalSpent.toLocaleString(undefined, {
            style: 'currency',
            currency: 'EUR'
          })}
        </strong>
        {orders.length ? (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td>
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleString()
                        : '—'}
                    </td>
                    <td>{o.status || '—'}</td>
                    <td>
                      {(o.totalPrice || 0).toLocaleString(undefined, {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        ) : (
          <div style={{ color: '#64748b' }}>Este usuario no tiene pedidos.</div>
        )}
      </Block>

      {/* ===== RESEÑAS ===== */}
      <Block>
        <strong>Reseñas ({reviewsTotal})</strong>
        {reviews.length ? (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Libro</th>
                  <th>Puntuación</th>
                  <th>Comentario</th>
                  <th style={{ width: 64, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => {
                  const isDeleting = deletingReviewIds.has(r._id)
                  return (
                    <tr key={r._id}>
                      <td>
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleString()
                          : '—'}
                      </td>
                      <td>
                        {typeof r.book === 'object'
                          ? r.book?.title || 'Libro'
                          : 'Libro'}
                      </td>
                      <td>{r.rating ?? '—'}</td>
                      <td>{r.comment || '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        {/* 👇 Botón de borrar sin contorno rojo (ghost) */}
                        <Button
                          $variant='ghost'
                          disabled={isDeleting}
                          onClick={async () => {
                            if (
                              !confirm('¿Eliminar esta reseña definitivamente?')
                            )
                              return
                            setDeletingReviewIds((s) => new Set(s).add(r._id))
                            try {
                              await deleteReview(r._id)
                              setReviews((arr) =>
                                arr.filter((x) => x._id !== r._id)
                              )
                              setReviewsTotal((n) => Math.max(0, n - 1))
                            } catch (e) {
                              console.error(e)
                              alert('No se pudo eliminar la reseña.')
                            } finally {
                              setDeletingReviewIds((s) => {
                                const next = new Set(s)
                                next.delete(r._id)
                                return next
                              })
                            }
                          }}
                          title='Eliminar reseña'
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </TableWrap>
        ) : (
          <div style={{ color: '#64748b' }}>
            Este usuario no ha hecho reseñas.
          </div>
        )}
      </Block>

      {/* ===== Mensaje interno ===== */}
      <Block>
        <strong>Mensaje interno al usuario</strong>
        <div style={{ display: 'grid', gap: 8 }}>
          <input
            placeholder='Asunto'
            value={message.subject}
            onChange={(e) =>
              setMessage((m) => ({ ...m, subject: e.target.value }))
            }
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border,#E2E8F0)',
              borderRadius: 10
            }}
          />
          <textarea
            rows={5}
            placeholder='Escribe tu mensaje…'
            value={message.body}
            onChange={(e) =>
              setMessage((m) => ({ ...m, body: e.target.value }))
            }
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border,#E2E8F0)',
              borderRadius: 10
            }}
          />
          <Button
            onClick={async () => {
              if (!message.subject.trim() && !message.body.trim()) {
                alert('Escribe asunto o mensaje')
                return
              }
              try {
                await adminSendMessageToUser(user._id, {
                  subject: message.subject,
                  body: message.body
                })
                setMessage({ subject: '', body: '' })
                alert('Mensaje enviado')
              } catch (e) {
                console.error(e)
                alert('No se pudo enviar el mensaje')
              }
            }}
          >
            Enviar
          </Button>
        </div>
      </Block>
    </Wrap>
  )
}
