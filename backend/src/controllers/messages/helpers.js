import User from '../../models/User.js'

export const SUPPORT_EMAIL_FALLBACK = 'kbookhelp@kbook.com'
//email admin por defecto.

// con un mensaje (m) y mi id meId, devuelvo la otra persona del hilo. si es de admin o si es de user.

export const getCounterpart = (m, meId) => {
  if (m.fromAdmin) return m.fromAdmin // admin a user
  if (m.fromUser) {
    const fromId = String(m.fromUser._id || m.fromUser)
    const me = String(meId)
    if (fromId === me) return m.to // si lo he enviado yo, el otro tiene que ser el receptor, y
    return m.fromUser // si lo recibo yo, el otro es enviador
  }
  return m.to // si no hay datos caigo a m.to
}

// para pdoer elegir a que admin enviar desde cliente contacto
export async function resolveSupportAdmin(toEmailFromClient) {
  const emailTarget = String(
    toEmailFromClient ||
      process.env.SUPPORT_ADMIN_EMAIL ||
      SUPPORT_EMAIL_FALLBACK
  ).toLowerCase()

  // 1 tener el admin por email exacto
  let admin = await User.findOne({ email: emailTarget, role: 'admin' }).select(
    '_id name email isBlocked createdAt lastLogin'
  )

  // Por si tenemos mas de un administrador, aunque no lo usare por el momento
  if (!admin) {
    admin = await User.findOne({ role: 'admin', isBlocked: { $ne: true } })
      .sort({ lastLogin: -1, createdAt: 1 })
      .select('_id name email isBlocked createdAt lastLogin')
  }

  return admin || null
}
