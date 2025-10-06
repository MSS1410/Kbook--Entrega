import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import api from '../../api'
import useAuth from '../../hooks/useAuth'

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
`
const Toggle = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
`
const Grid = styled.ul`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
`
const Item = styled.li`
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.cardBg};
`
const From = styled.div`
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
`
const Body = styled.div`
  margin-top: 6px;
  white-space: pre-wrap;
  color: ${({ theme }) => theme.colors.text};
`
const DateSmall = styled.small`
  margin-top: 6px;
  display: block;
  color: ${({ theme }) => theme.colors.mutedText};
`

export default function MessagesAccordion({ open: controlledOpen, onToggle }) {
  // Soporte controlado / no controlado
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const toggle = onToggle ?? (() => setInternalOpen((o) => !o))

  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const userId = String(user?._id || user?.id || '')
  const fetchingRef = useRef(false)

  useEffect(() => {
    if (!open) return
    if (fetchingRef.current) return
    fetchingRef.current = true
    let cancelled = false

    const run = async () => {
      setError(null)
      setLoading(true)

      try {
        const received = []

        // 1) Threads P2P
        let threads = []
        try {
          const { data } = await api.get('/api/messages/threads')
          threads = Array.isArray(data?.threads) ? data.threads : []
        } catch {
          threads = []
        }

        if (threads.length > 0) {
          const top = threads.slice(0, 6)
          const results = await Promise.allSettled(
            top.map((t) => api.get(`/api/messages/threads/${t.id}`))
          )

          for (const r of results) {
            if (r.status !== 'fulfilled') continue
            const msgs = Array.isArray(r.value?.data?.messages)
              ? r.value.data.messages
              : []
            for (const m of msgs) {
              const fromId = String(m.from?._id || '')
              if (fromId && fromId !== userId) {
                received.push({
                  _id: m._id,
                  from: m.from,
                  body: m.body,
                  createdAt: m.createdAt
                })
              }
            }
          }
        }

        // 2) Fallback admin→user si aún no hay
        if (received.length === 0) {
          try {
            const { data } = await api.get('/api/users/messages', {
              params: { limit: 10, page: 1 }
            })
            const arr = Array.isArray(data?.items) ? data.items : []
            for (const m of arr) {
              if (m?.fromAdmin) {
                received.push({
                  _id: m._id,
                  from: m.fromAdmin,
                  body: m.body,
                  createdAt: m.createdAt
                })
              }
            }
          } catch {}
        }

        // 3) dedup + orden desc + top 3
        const map = new Map()
        for (const r of received) map.set(String(r._id), r)
        const top3 = [...map.values()]
          .sort(
            (a, b) => +new Date(b.createdAt || 0) - +new Date(a.createdAt || 0)
          )
          .slice(0, 3)

        if (!cancelled) setItems(top3)
      } catch {
        if (!cancelled) setError('No pudimos cargar tus mensajes.')
      } finally {
        if (!cancelled) setLoading(false)
        fetchingRef.current = false
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [open, userId])

  return (
    <Card>
      <Toggle onClick={toggle} aria-expanded={open} role='button'>
        <div style={{ fontWeight: 700 }}>Mensajes</div>
        <div>{open ? '▾' : '▸'}</div>
      </Toggle>

      {open && (
        <>
          {loading && <p>Cargando mensajes…</p>}
          {error && <p>{error}</p>}
          {!loading && !error && items.length === 0 && (
            <p>Todavía no tienes mensajes.</p>
          )}
          {items.length > 0 && (
            <Grid>
              {items.map((m) => (
                <Item key={m._id}>
                  <From>{m.from?.name || 'Usuario'}</From>
                  <Body>{m.body || '(Sin contenido)'}</Body>
                  <DateSmall>
                    {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                  </DateSmall>
                </Item>
              ))}
            </Grid>
          )}
        </>
      )}
    </Card>
  )
}
