import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { isAuth } from '../../middlewares/isAuth.js'
import { isAdmin } from '../../middlewares/isAdmin.js'
import User from '../../models/User.js'

const router = express.Router()

// carpeta /uploads/avatars
const uploadDir = path.resolve('uploads/avatars')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase()
    const base = path.basename(file.originalname || 'avatar', ext)
    const safe = base.replace(/[^a-z0-9_\-]+/gi, '_')
    cb(null, `${safe}_${Date.now()}${ext}`)
  }
})

const fileFilter = (_req, file, cb) => {
  const ok = /^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype)
  if (!ok) return cb(new Error('Tipo de archivo no permitido (solo imágenes)'))
  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
})

// POST /api/admin/users/:id/avatar
router.post(
  '/users/:id/avatar',
  isAuth,
  isAdmin,
  upload.single('avatar'),
  async (req, res, next) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: 'Falta archivo avatar' })
      const user = await User.findById(req.params.id)
      if (!user)
        return res.status(404).json({ message: 'Usuario no encontrado' })

      // guarda path público
      const rel = `/uploads/avatars/${req.file.filename}`
      user.avatar = rel
      await user.save()

      res.json({ avatar: rel })
    } catch (err) {
      next(err)
    }
  }
)

export default router
