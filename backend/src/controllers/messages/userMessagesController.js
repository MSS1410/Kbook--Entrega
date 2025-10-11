import Message from '../../models/Message.js'
import User from '../../models/User.js'
import { getCounterpart, resolveSupportAdmin } from './helpers.js'

// para elegir el admin de soporte, email directo o env
export const userSendMessageToAdmin = async (req, res, next) => {
  try {
    const { subject = '', body = '', toEmail } = req.body || {}

    if (!subject.trim() && !body.trim()) {
      return res.status(400).json({ message: 'Asunto o mensaje requerido' })
    }

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
    //creamos mensaje
    const msg = await Message.create({
      to: admin._id,
      fromUser: req.user._id,
      subject: subject.trim(),
      body: body.trim(),
      read: false
    })

    return res.status(201).json(msg)
  } catch (err) {
    next(err)
  }
}

//lista bandeja de entrada usuario, con mensajes de adminm
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

// marcar mensaje como leido o no leido si el receptor es usuario del web to = req.user._id
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
    if (!updated)
      return res.status(404).json({ message: 'Mensaje no encontrado' })
    res.json(updated)
  } catch (err) {
    next(err)
  }
}

//mensajeria de ysyarui a uysyruio.
//necesito asegurar que no lo envie a mi mismo. Destinatario existe y creare mensaje
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

// Para generar si hace falta un chatcon otro usuario. Con opcion de enviar el primer mensaje, firstMessage, debo devolver con thread:{id, user, lastAt}
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

// atrapo todos los mensajes donde yo soy to o fromUser.
//fecha descend, con getCounterpart (meId) consigo lista de chats para tener al otro
export const listThreads = async (req, res, next) => {
  try {
    const msgs = await Message.find({
      $or: [{ to: req.user._id }, { fromUser: req.user._id }]
    })
      .sort({ createdAt: -1 })
      .populate('to', 'name email avatar')
      .populate('fromAdmin', 'name email avatar')
      .populate('fromUser', 'name email avatar')

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

// devolver conversacion entre usuario act + participantId, en todas las direcciones que pueda ser de admin o usuario OK
export const listThreadMessages = async (req, res, next) => {
  try {
    const { participantId } = req.params
    const a = req.user._id
    const b = participantId

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

// me saco a mi mismo de la busqueda, por name o email. 20 results con datos necesarios de user.
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
