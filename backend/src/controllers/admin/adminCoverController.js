// backend/src/controllers/admin/adminCoverController.js
import Book from '../../models/Book.js'

export const adminUploadBookCover = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!req.file) {
      return res.status(400).json({ message: 'Archivo "cover" requerido.' })
    }

    // Guardamos la URL pública que servirá Express estático
    const publicUrl = `/uploads/covers/${req.file.filename}`

    const book = await Book.findByIdAndUpdate(
      id,
      { coverImage: publicUrl },
      { new: true }
    )

    if (!book) {
      return res.status(404).json({ message: 'Libro no encontrado' })
    }

    return res.status(201).json({ ok: true, coverImage: publicUrl, book })
  } catch (err) {
    next(err)
  }
}
