// backend/src/controllers/admin/authorsController.js
import Author from '../../models/Author.js'

export const adminCreateAuthor = async (req, res, next) => {
  try {
    const { name, biography, featured, photo } = req.body
    const author = await Author.create({
      name,
      biography: biography || '',
      featured: !!featured,
      photo: photo || ''
    })
    res.status(201).json(author)
  } catch (err) {
    next(err)
  }
}

export const adminUpdateAuthor = async (req, res, next) => {
  try {
    const { id } = req.params
    const update = { ...req.body }
    const author = await Author.findByIdAndUpdate(id, update, { new: true })
    if (!author) return res.status(404).json({ message: 'Autor no encontrado' })
    res.json(author)
  } catch (err) {
    next(err)
  }
}

export const adminDeleteAuthor = async (req, res, next) => {
  try {
    const { id } = req.params
    const del = await Author.findByIdAndDelete(id)
    if (!del) return res.status(404).json({ message: 'Autor no encontrado' })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

// Compatibilidad si hay endpoint que cambia la URL de foto sin upload
export const adminUpdateAuthorPhoto = async (req, res, next) => {
  try {
    const { id } = req.params
    const { photo } = req.body
    const updated = await Author.findByIdAndUpdate(
      id,
      { photo: photo || '' },
      { new: true }
    ).select('_id name photo')
    if (!updated)
      return res.status(404).json({ message: 'Autor no encontrado' })
    res.json(updated)
  } catch (err) {
    next(err)
  }
}

export const adminToggleAuthorFeatured = async (req, res, next) => {
  try {
    const { id } = req.params
    const author = await Author.findById(id)
    if (!author) return res.status(404).json({ message: 'Autor no encontrado' })
    author.featured = !author.featured
    await author.save()
    res.json({ _id: author._id, featured: author.featured })
  } catch (err) {
    next(err)
  }
}
