// backend/src/controllers/messages/adminMessagesController.js
import mongoose from 'mongoose'
import Message from '../../models/Message.js'
import User from '../../models/User.js'

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

// GET /api/admin/inbox?page=&limit=&unread=1
export const adminInbox = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10))
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit || '10', 10))
    )
    const skip = (page - 1) * limit

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

// GET /api/admin/users/:id/messages
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

// GET /api/admin/users/:id/thread
export const adminGetThreadWithUser = async (req, res, next) => {
  try {
    const otherId = req.params.id
    const me = req.user._id

    const items = await Message.find({
      $or: [
        { to: otherId, fromAdmin: me }, // admin → user
        { to: me, fromUser: otherId } // user → admin
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

// PATCH /api/admin/messages/:id/read
export const adminMarkMessageRead = async (req, res, next) => {
  try {
    const { id } = req.params
    let { read } = req.body
    if (typeof read === 'undefined') read = true

    const updated = await Message.findOneAndUpdate(
      { _id: id, to: req.user._id, fromUser: { $exists: true } },
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

// PATCH /api/admin/users/:id/messages/read
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

// DELETE /api/admin/users/:id/thread
export const adminDeleteThreadWithUser = async (req, res, next) => {
  try {
    const userId = req.params.id
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'userId inválido' })
    }

    const adminId = req.user._id
    const result = await Message.deleteMany({
      $or: [
        { fromUser: userId, to: adminId },
        { fromAdmin: adminId, to: userId }
      ]
    })

    return res.json({ deleted: result?.deletedCount || 0 })
  } catch (err) {
    next(err)
  }
}
