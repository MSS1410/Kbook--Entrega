// backend/src/routes/admin/adminAuthorPhoto.js
import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { isAuth } from '../../middlewares/isAuth.js'
import { isAdmin } from '../../middlewares/isAdmin.js'
import Author from '../../models/Author.js'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// === carpeta destino ===
const UPLOAD_DIR = path.resolve(__dirname, '../../../uploads/authors')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

// === Multer config ===
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg'
    const id = req.params.id
    const name = `author-${id}-${Date.now()}${ext}`
    cb(null, name)
  }
})

const fileFilter = (_req, file, cb) => {
  if (!file || !file.mimetype) return cb(null, false)
  if (/^image\/(jpe?g|png|webp|gif|bmp)$/i.test(file.mimetype))
    return cb(null, true)
  cb(new Error('Solo se permiten imágenes'))
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
})

// POST /api/admin/authors/:id/photo
router.post(
  '/authors/:id/photo',
  isAuth,
  isAdmin,
  upload.single('photo'),
  async (req, res, next) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: 'Archivo "photo" requerido' })
      const rel = `/uploads/authors/${req.file.filename}`

      // actualiza el campo "photo" (ajusta el nombre si tu schema usa otro)
      const updated = await Author.findByIdAndUpdate(
        req.params.id,
        { photo: rel },
        { new: true }
      ).select('_id name photo')

      if (!updated)
        return res.status(404).json({ message: 'Autor no encontrado' })
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }
)

export default router
