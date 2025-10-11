export const fmtDateTime = (iso) => new Date(iso).toLocaleString()
// fecha/hora en local
// para InboxList y ThreadView

export const trimSubject = (s = '') =>
  String(s)
    .replace(/^(\s*(re:|respuesta:)\s*)+/gi, '') //limpia "Re:" / "Respuesta:"
    .trim()

// normaliza formato d  1 mensaje crudo del inbox
export function normalizeInboxItem(m) {
  const u = m.fromUser || {}
  return {
    messageId: m._id,
    userId: u?._id, //  clave para agrupar por usuario
    userName: u?.name || u?.email || 'Usuario',
    userAvatar: u?.avatar || '',
    subject: m.subject || '(Sin asunto)',
    snippet: m.body || '',
    createdAt: m.createdAt,
    read: !!m.read
  }
}

//  compacta lista de mensajes crudos a 1 item por user
export function compactByUser(items) {
  const map = new Map()
  for (const raw of items) {
    const it = normalizeInboxItem(raw)
    const key = String(it.userId) //  grouped por userId
    const prev = map.get(key)
    //  en tarjeta mostramos el mas reciente
    if (!prev || new Date(it.createdAt) > new Date(prev.createdAt)) {
      map.set(key, { ...it })
    }
    // flag unread para msg no leido
    if (!it.read) {
      const cur = map.get(key)
      map.set(key, { ...cur, unread: true })
    }
  }
  //fechado por orden desc
  return [...map.values()].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  )
}
