import { useEffect, useMemo, useState } from 'react'
import { listAllUsersAdmin, toggleUserBlockAdmin } from '../api/adminApi.js'

// intencion, importar listado de users para el panel admin., list allusers, toggleuserblock, desde adminApi.js

export default function useUsersList(pageSize = 12) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [order, setOrder] = useState('new') // new | old
  const [page, setPage] = useState(1)

  // cargo todos usuarios
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const all = await listAllUsersAdmin()
        setUsers(Array.isArray(all) ? all : [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])
  // aplico filtros orden y paginacion.
  //useMemo, para derivar pageItems
  const filtered = useMemo(() => {
    let arr = [...users]
    if (q.trim()) {
      const s = q.trim().toLowerCase()
      arr = arr.filter((u) => (u.name || '').toLowerCase().includes(s))
    }
    arr.sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime()
      const db = new Date(b.createdAt || 0).getTime()
      return order === 'new' ? db - da : da - db
    })
    return arr
  }, [users, q, order])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const onToggleBlock = async (u) => {
    await toggleUserBlockAdmin(u._id, !u.isBlocked)
    setUsers((arr) =>
      arr.map((x) => (x._id === u._id ? { ...x, isBlocked: !u.isBlocked } : x))
    )
  }

  return {
    users,
    loading,
    q,
    setQ,
    order,
    setOrder,
    page,
    setPage,
    totalPages,
    pageItems,
    onToggleBlock
  }
}
