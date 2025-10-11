import fs from 'fs'
import path from 'path'
import User from '../models/User.js'

const pickUploadedFile = (req) => {
  if (req.file) return req.file
  // .any(): array plano
  if (Array.isArray(req.files) && req.files[0]) return req.files[0]
  // .fields(): objeto por nombre
  if (req.files?.file?.[0]) return req.files.file[0]
  if (req.files?.avatar?.[0]) return req.files.avatar[0]
  return null
}

export const setAvatar = async (req, res, next) => {
  try {
    const f = pickUploadedFile(req)
    if (!f) return res.status(400).json({ message: 'Falta archivo' })

    const rel = `/uploads/avatars/${f.filename}`

    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })

    // borra avatar local anterior si lo había
    if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      try {
        fs.unlinkSync(path.resolve(`.${user.avatar}`))
      } catch (_) {}
    }

    user.avatar = rel
    await user.save()

    // Devolvemos en ambos formatos para máxima compatibilidad
    res.json({ avatar: user.avatar, user })
  } catch (err) {
    next(err)
  }
}

export const deleteAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })

    if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      try {
        fs.unlinkSync(path.resolve(`.${user.avatar}`))
      } catch (_) {}
    }

    user.avatar = ''
    await user.save()

    res.json({ user })
  } catch (err) {
    next(err)
  }
}
