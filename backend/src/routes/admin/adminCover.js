// backend/src/routes/admin/adminCover.js
import express from 'express'
import { isAuth } from '../../middlewares/isAuth.js'
import { isAdmin } from '../../middlewares/isAdmin.js'
import { uploadBookCoverMdw } from '../../middlewares/uploadBookCover.js'
import { adminUploadBookCover } from '../../controllers/admin/adminCoverController.js'

const router = express.Router()

// 🔎 debug: saber que el router se montó
router.get('/_ping_covers', (_req, res) => res.json({ ok: true }))

// POST /api/admin/books/:id/cover  (multipart/form-data con campo "cover")
router.post(
  '/books/:id/cover',
  isAuth,
  isAdmin,
  uploadBookCoverMdw.single('cover'),
  adminUploadBookCover
)

export default router
