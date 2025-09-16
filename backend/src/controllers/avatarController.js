// backend/src/controllers/avatarController.js
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.resolve('uploads/avatars')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${req.user._id}${ext}`)
  }
})

export const upload = multer({ storage })

export const uploadAvatar = async (req, res, next) => {
  try {
    // Multer ya habrá guardado el archivo y puesto info en req.file
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' })
    }
    // Construye la ruta relativa que usarás en frontend
    const avatarUrl = `/uploads/avatars/${req.file.filename}`
    // Actualiza el campo avatar en el usuario logueado
    req.user.avatar = avatarUrl
    await req.user.save()
    res.json({ avatar: avatarUrl })
  } catch (err) {
    next(err)
  }
}
