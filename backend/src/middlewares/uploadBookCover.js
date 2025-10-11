import multer from 'multer'
import path from 'path'
import fs from 'fs'

const dest = path.resolve('uploads/covers')
fs.mkdirSync(dest, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dest),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    // por si quieres auditar: req.params.id es el libro
    cb(null, `book-${req.params.id}-${Date.now()}${ext}`)
  }
})

const fileFilter = (_req, file, cb) => {
  const ok = /image\/(jpeg|png|webp)/i.test(file.mimetype)
  cb(ok ? null : new Error('Tipo de archivo no permitido (imagen).'), ok)
}

export const uploadBookCoverMdw = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
})
