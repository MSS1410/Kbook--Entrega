// backend/src/middlewares/uploadAvatar.js
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const dest = path.resolve('uploads/avatars')
fs.mkdirSync(dest, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dest),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${req.user._id}-${Date.now()}${ext}`)
  }
})

const fileFilter = (req, file, cb) => {
  const ok = /image\/(jpeg|png|webp)/.test(file.mimetype)
  cb(ok ? null : new Error('Solo imágenes JPEG/PNG/WEBP'), ok)
}

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
})
