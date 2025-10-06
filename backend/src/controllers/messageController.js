// backend/src/controllers/messageController.js
import Message from '../models/Message.js'
import User from '../models/User.js'

/* =========================================================
 *  HELPERS (P2P sin colección Thread)
 * ========================================================= */

// Dado un mensaje y el usuario actual, devuelve el "interlocutor" (User)
const getCounterpart = (m, meId) => {
  if (m.fromAdmin) return m.fromAdmin // admin -> user
  if (m.fromUser) {
    const fromId = String(m.fromUser._id || m.fromUser)
    const me = String(meId)
    // si lo envié yo (usuario), el otro es el destinatario
    if (fromId === me) return m.to
    // si lo recibí yo, el otro es el remitente
    return m.fromUser
  }
  // fallback raro
  return m.to
}

/* =========================================================
 *  ADMIN (requiere isAdmin)
 * ========================================================= */

// POST /api/admin/users/:id/messages
export const adminSendMessage = async (req, res, next) => {
  try {
    const toUserId = req.params.id
    const { subject = '', body = '' } = req.body

    if (!subject.trim() && !body.trim()) {
      return res.status(400).json({ message: 'Asunto o mensaje requerido' })
    }

    const exists = await User.exists({ _id: toUserId })
    if (!exists) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    const msg = await Message.create({
      to: toUserId,
      fromAdmin: req.user._id,
      subject: subject.trim(),
      body: body.trim(),
      read: false
    })

    res.status(201).json(msg)
  } catch (err) {
    next(err)
  }
}

// GET /api/admin/inbox?page=&limit=
// Solo MENSAJES RECIBIDOS por el admin (de usuarios), con paginación.
// GET /api/admin/inbox?page=&limit=&unread=1
export const adminInbox = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10))
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit || '10', 10))
    )
    const skip = (page - 1) * limit

    // ⬇️ Nuevo: permitir ?unread=1|true para filtrar no leídos
    const unreadParam = (req.query.unread || '').toString().toLowerCase()
    const onlyUnread = ['1', 'true', 'yes', 'y'].includes(unreadParam)

    const baseFilter = { to: req.user._id, fromUser: { $exists: true } }
    const filter = onlyUnread ? { ...baseFilter, read: false } : baseFilter

    const [items, total, unreadCount] = await Promise.all([
      Message.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('fromUser', 'name email avatar')
        .lean(),
      Message.countDocuments(filter),
      Message.countDocuments({ ...baseFilter, read: false })
    ])

    res.json({ items, total, page, limit, unreadCount })
  } catch (err) {
    next(err)
  }
}

// GET /api/admin/users/:id/messages?limit=&page=
// (Se mantiene por compatibilidad) → mensajes dirigidos a ESE usuario (admin → user)
export const adminListMessagesToUser = async (req, res, next) => {
  try {
    const toUserId = req.params.id
    const page = Math.max(1, parseInt(req.query.page || '1', 10))
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit || '20', 10))
    )
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      Message.find({ to: toUserId, fromAdmin: { $exists: true } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('to', 'name email avatar')
        .populate('fromAdmin', 'name email avatar')
        .populate('fromUser', 'name email avatar'),
      Message.countDocuments({ to: toUserId, fromAdmin: { $exists: true } })
    ])

    res.json({ items, total, page, limit })
  } catch (err) {
    next(err)
  }
}

// === NUEVO ===
// GET /api/admin/users/:id/thread
// Devuelve el hilo BIDIRECCIONAL entre el admin actual y el usuario :id
export const adminGetThreadWithUser = async (req, res, next) => {
  try {
    const otherId = req.params.id
    const me = req.user._id

    const items = await Message.find({
      $or: [
        // admin → user
        { to: otherId, fromAdmin: me },
        // user → admin
        { to: me, fromUser: otherId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('fromAdmin', 'name email avatar')
      .populate('fromUser', 'name email avatar')
      .lean()

    const messages = items.map((m) => ({
      _id: m._id,
      from: m.fromAdmin || m.fromUser || null,
      subject: m.subject,
      body: m.body,
      createdAt: m.createdAt
    }))

    res.json({ messages })
  } catch (err) {
    next(err)
  }
}

// === NUEVO ===
// PATCH /api/admin/messages/:id/read   { read: true|false }
export const adminMarkMessageRead = async (req, res, next) => {
  try {
    const { id } = req.params
    let { read } = req.body
    if (typeof read === 'undefined') read = true

    // Solo puede marcar como leído un mensaje recibido por él
    const updated = await Message.findOneAndUpdate(
      { _id: id, to: req.user._id, fromUser: { $exists: true } },
      { read: !!read },
      { new: true }
    )
    if (!updated) {
      return res.status(404).json({ message: 'Mensaje no encontrado' })
    }
    res.json(updated)
  } catch (err) {
    next(err)
  }
}

// === NUEVO ===
// PATCH /api/admin/users/:id/messages/read  → marca leídos todos los recibidos de ese usuario
export const adminMarkAllFromUserRead = async (req, res, next) => {
  try {
    const otherId = req.params.id
    const result = await Message.updateMany(
      { to: req.user._id, fromUser: otherId, read: false },
      { $set: { read: true } }
    )
    res.json({
      matched: result.matchedCount ?? result.n,
      modified: result.modifiedCount ?? result.nModified
    })
  } catch (err) {
    next(err)
  }
}

// === NUEVO ===
// DELETE /api/admin/messages/:id
export const adminDeleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params
    const deleted = await Message.findByIdAndDelete(id)
    if (!deleted)
      return res.status(404).json({ message: 'Mensaje no encontrado' })
    res.json({ message: 'Mensaje eliminado' })
  } catch (err) {
    next(err)
  }
}

// === NUEVO (opcional) ===
// DELETE /api/admin/users/:id/thread   → elimina TODOS los mensajes admin↔usuario (¡destructivo!)
export const adminDeleteThreadWithUser = async (req, res, next) => {
  try {
    const userId = req.params.id
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'userId inválido' })
    }

    // Si quieres limitarlo al admin actual:
    const adminId = req.user._id
    const result = await Message.deleteMany({
      $or: [
        // mensajes del usuario → admin actual
        { fromUser: userId, to: adminId },
        // mensajes del admin actual → usuario
        { fromAdmin: adminId, to: userId }
      ]
    })

    // Versión amplia (borra todo lo que involucre al user, sin importar admin):
    // const result = await Message.deleteMany({
    //   $or: [{ fromUser: userId }, { to: userId }]
    // })

    return res.json({ deleted: result?.deletedCount || 0 })
  } catch (err) {
    next(err)
  }
}

/* =========================================================
 *  USUARIO (requiere isAuth)
 * ========================================================= */

// POST /api/users/messages  (usuario → admin)
export const userSendMessageToAdmin = async (req, res, next) => {
  try {
    const { subject = '', body = '', toEmail } = req.body || {}

    if (!subject.trim() && !body.trim()) {
      return res.status(400).json({ message: 'Asunto o mensaje requerido' })
    }

    // Elegimos el admin correcto (por email), con fallback
    const admin = await resolveSupportAdmin(toEmail)
    if (!admin) {
      return res
        .status(503)
        .json({ message: 'No hay administradores disponibles' })
    }
    if (admin.isBlocked) {
      return res
        .status(403)
        .json({ message: 'El administrador receptor está bloqueado' })
    }

    // Creamos el mensaje dirigido a ese admin
    const msg = await Message.create({
      to: admin._id, // 👈 destino correcto
      fromUser: req.user._id, // remitente autenticado
      subject: subject.trim(),
      body: body.trim(),
      read: false
    })

    return res.status(201).json(msg)
  } catch (err) {
    next(err)
  }
}

// GET /api/users/messages?limit=&page=&unread=1
export const userListMessages = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10))
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit || '20', 10))
    )
    const skip = (page - 1) * limit

    const unreadParam = (req.query.unread || '').toString().toLowerCase()
    const onlyUnread = ['1', 'true', 'yes', 'y'].includes(unreadParam)

    // Por defecto: mensajes QUE LE LLEGAN al usuario (enviados por admin)
    const filter = { to: req.user._id, fromAdmin: { $exists: true } }
    if (onlyUnread) filter.read = false

    const [items, total, unreadCount] = await Promise.all([
      Message.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('fromAdmin', 'name email avatar'),
      Message.countDocuments(filter),
      Message.countDocuments({
        to: req.user._id,
        fromAdmin: { $exists: true },
        read: false
      })
    ])

    res.json({ items, total, page, limit, unreadCount })
  } catch (err) {
    next(err)
  }
}

// PATCH /api/users/messages/:id/read   { read: true|false }  (por defecto true)
export const userReadMessage = async (req, res, next) => {
  try {
    const { id } = req.params
    let { read } = req.body
    if (typeof read === 'undefined') read = true

    const updated = await Message.findOneAndUpdate(
      { _id: id, to: req.user._id },
      { read: !!read },
      { new: true }
    )

    if (!updated) {
      return res.status(404).json({ message: 'Mensaje no encontrado' })
    }

    res.json(updated)
  } catch (err) {
    next(err)
  }
}

/* =========================================================
 *  P2P NUEVO (requiere isAuth)
 * ========================================================= */

// POST /api/messages/threads/:participantId/messages
export const userSendMessageToUser = async (req, res, next) => {
  try {
    const { participantId } = req.params
    const { subject = '', body = '' } = req.body
    if (!subject.trim() && !body.trim()) {
      return res.status(400).json({ message: 'Asunto o mensaje requerido' })
    }
    if (String(participantId) === String(req.user._id)) {
      return res
        .status(400)
        .json({ message: 'No puedes enviarte mensajes a ti mismo' })
    }

    const exists = await User.exists({ _id: participantId })
    if (!exists)
      return res.status(404).json({ message: 'Usuario destino no existe' })

    const msg = await Message.create({
      to: participantId,
      fromUser: req.user._id,
      subject: subject.trim(),
      body: body.trim(),
      read: false
    })

    res.status(201).json({ message: msg })
  } catch (err) {
    next(err)
  }
}

// POST /api/messages/threads   { participantId, firstMessage? , subject? }
export const startThread = async (req, res, next) => {
  try {
    const { participantId, firstMessage = '', subject = '' } = req.body
    if (!participantId)
      return res.status(400).json({ message: 'participantId requerido' })
    if (String(participantId) === String(req.user._id)) {
      return res
        .status(400)
        .json({ message: 'No puedes iniciar chat contigo mismo' })
    }

    const user = await User.findById(participantId).select(
      '_id name email avatar'
    )
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })

    if (firstMessage?.trim()) {
      await Message.create({
        to: participantId,
        fromUser: req.user._id,
        subject: subject?.trim() || '(Nuevo chat)',
        body: firstMessage.trim(),
        read: false
      })
    }

    const thread = { id: user._id, user, lastAt: Date.now() }
    res.status(201).json({ thread })
  } catch (err) {
    next(err)
  }
}

// GET /api/messages/threads
export const listThreads = async (req, res, next) => {
  try {
    // Todos los mensajes donde yo participo (enviando o recibiendo)
    const msgs = await Message.find({
      $or: [{ to: req.user._id }, { fromUser: req.user._id }]
    })
      .sort({ createdAt: -1 })
      .populate('to', 'name email avatar')
      .populate('fromAdmin', 'name email avatar')
      .populate('fromUser', 'name email avatar')

    // Agrupar por interlocutor
    const map = new Map()
    for (const m of msgs) {
      const other = getCounterpart(m, req.user._id)
      if (!other) continue
      const key = String(other._id)
      const prev = map.get(key)
      const lastAt = Math.max(prev?.lastAt || 0, +new Date(m.createdAt))
      map.set(key, { id: other._id, user: other, lastAt })
    }

    const threads = [...map.values()].sort((a, b) => b.lastAt - a.lastAt)
    res.json({ threads })
  } catch (err) {
    next(err)
  }
}

// GET /api/messages/threads/:participantId
// backend/src/controllers/messageController.js

export const listThreadMessages = async (req, res, next) => {
  try {
    const { participantId } = req.params
    const a = req.user._id // yo (sea admin o user)
    const b = participantId // el otro

    // ✅ incluir ambas direcciones, tanto fromUser como fromAdmin
    const items = await Message.find({
      $or: [
        { to: a, $or: [{ fromUser: b }, { fromAdmin: b }] },
        { to: b, $or: [{ fromUser: a }, { fromAdmin: a }] }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('fromAdmin', 'name email avatar')
      .populate('fromUser', 'name email avatar')

    const messages = items.map((m) => ({
      _id: m._id,
      from: m.fromAdmin || m.fromUser || null,
      body: m.body,
      subject: m.subject,
      createdAt: m.createdAt
    }))

    res.json({ messages })
  } catch (err) {
    next(err)
  }
}

// GET /api/messages/users/search?q=texto
export const searchUsersForMessage = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim()
    if (!q) return res.json({ users: [] })
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [{ name: rx }, { email: rx }]
    })
      .limit(20)
      .select('_id name email avatar')

    res.json({ users })
  } catch (err) {
    next(err)
  }
}

// pasar el contact sent a admin real
// --- helper NUEVO: resuelve el admin de soporte por email con fallbacks ---
const SUPPORT_EMAIL_FALLBACK = 'kbookhelp@kbook.com'

async function resolveSupportAdmin(toEmailFromClient) {
  // prioridad: lo que venga del front > env > fallback
  const emailTarget = String(
    toEmailFromClient ||
      process.env.SUPPORT_ADMIN_EMAIL ||
      SUPPORT_EMAIL_FALLBACK
  ).toLowerCase()

  // 1) Buscar admin por email exacto
  let admin = await User.findOne({
    email: emailTarget,
    role: 'admin'
  }).select('_id name email isBlocked createdAt lastLogin')

  // 2) Si no existe, buscar cualquier admin no bloqueado (más reciente activo)
  if (!admin) {
    admin = await User.findOne({ role: 'admin', isBlocked: { $ne: true } })
      .sort({ lastLogin: -1, createdAt: 1 })
      .select('_id name email isBlocked createdAt lastLogin')
  }

  return admin || null
}
