// backend/src/controllers/messages/helpers.js
import User from '../../models/User.js'

export const SUPPORT_EMAIL_FALLBACK = 'kbookhelp@kbook.com'

// Dado un mensaje y el usuario actual, devuelve el "interlocutor" (User)
export const getCounterpart = (m, meId) => {
  if (m.fromAdmin) return m.fromAdmin // admin -> user
  if (m.fromUser) {
    const fromId = String(m.fromUser._id || m.fromUser)
    const me = String(meId)
    if (fromId === me) return m.to // si lo envié yo, el otro es el destinatario
    return m.fromUser // si lo recibí yo, el otro es el remitente
  }
  return m.to // fallback
}

// Resuelve el admin de soporte por email con fallbacks
export async function resolveSupportAdmin(toEmailFromClient) {
  const emailTarget = String(
    toEmailFromClient ||
      process.env.SUPPORT_ADMIN_EMAIL ||
      SUPPORT_EMAIL_FALLBACK
  ).toLowerCase()

  // 1) Admin por email exacto
  let admin = await User.findOne({ email: emailTarget, role: 'admin' }).select(
    '_id name email isBlocked createdAt lastLogin'
  )

  // 2) Cualquier admin no bloqueado (más reciente activo)
  if (!admin) {
    admin = await User.findOne({ role: 'admin', isBlocked: { $ne: true } })
      .sort({ lastLogin: -1, createdAt: 1 })
      .select('_id name email isBlocked createdAt lastLogin')
  }

  return admin || null
}
