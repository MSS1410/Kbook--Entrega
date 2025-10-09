// frontend/src/features/admin/pages/contact/contactUtils.js
export const fmtDateTime = (iso) => new Date(iso).toLocaleString()

export const trimSubject = (s = '') =>
  String(s)
    .replace(/^(\s*(re:|respuesta:)\s*)+/gi, '')
    .trim()

export function normalizeInboxItem(m) {
  const u = m.fromUser || {}
  return {
    messageId: m._id,
    userId: u?._id,
    userName: u?.name || u?.email || 'Usuario',
    userAvatar: u?.avatar || '',
    subject: m.subject || '(Sin asunto)',
    snippet: m.body || '',
    createdAt: m.createdAt,
    read: !!m.read
  }
}

export function compactByUser(items) {
  const map = new Map()
  for (const raw of items) {
    const it = normalizeInboxItem(raw)
    const key = String(it.userId)
    const prev = map.get(key)
    if (!prev || new Date(it.createdAt) > new Date(prev.createdAt)) {
      map.set(key, { ...it })
    }
    if (!it.read) {
      const cur = map.get(key)
      map.set(key, { ...cur, unread: true })
    }
  }
  return [...map.values()].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  )
}
