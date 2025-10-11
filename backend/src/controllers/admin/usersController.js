import User from '../../models/User.js'
import crypto from 'node:crypto'

// backend/src/controllers/admin/usersController.js
export const adminListUsers = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20, order } = req.query
    const sortDir = String(order || 'desc').toLowerCase() === 'asc' ? 1 : -1
    const filter = {}
    if (q) {
      filter.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }]
    }

    //busqueda por q por nombre o mail

    const skip = (Number(page) - 1) * Number(limit)
    // me quedo solo con los campos que necesito
    const [itemsRaw, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: sortDir })
        .skip(skip)
        .limit(Number(limit))
        // debo añadir avatar para poder mostrarlo
        .select(
          'name email role blocked createdAt lastLogin description avatar'
        )
        .lean(),
      User.countDocuments(filter)
    ])

    // he renombrado blocked a isblocked para asi poder asegurar el avatar del user.
    const users = itemsRaw.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      isBlocked: !!u.blocked,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin || null,
      description: u.description || '',
      avatar:
        (u.avatar && typeof u.avatar === 'object' && u.avatar.url) ||
        u.avatar ||
        ''
    }))

    // Devolvemos "users" (y "items" por compatibilidad con pickArray)
    res.json({
      users,
      items: users,
      total,
      page: Number(page),
      limit: Number(limit)
    })
  } catch (err) {
    next(err)
  }
}

export const adminUpdateUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const update = { ...req.body }
    const allowed = ['name', 'email', 'description', 'shipping', 'payment']
    Object.keys(update).forEach((k) => {
      if (!allowed.includes(k)) delete update[k]
    })

    const updated = await User.findByIdAndUpdate(id, update, { new: true })
      .select('-password')
      .lean()
    if (!updated)
      return res.status(404).json({ message: 'Usuario no encontrado' })
    res.json(updated)
  } catch (err) {
    next(err)
  }
}

export const adminDeleteUser = async (req, res, next) => {
  try {
    const { id } = req.params

    if (String(req.user._id) === String(id)) {
      return res
        .status(400)
        .json({ message: 'No puedes eliminarte a ti mismo' })
    }

    const target = await User.findById(id)
    if (!target)
      return res.status(404).json({ message: 'Usuario no encontrado' })

    if (target.role === 'admin') {
      const admins = await User.countDocuments({
        role: 'admin',
        _id: { $ne: id }
      })
      if (admins === 0) {
        return res
          .status(400)
          .json({ message: 'No puedes eliminar al último administrador' })
      }
    }

    // Soft delete + anonimización
    const surrogateEmail = `deleted+${target._id}@example.invalid`
    const randomPwd = crypto.randomBytes(24).toString('hex')

    target.name = 'Usuario eliminado'
    target.email = surrogateEmail
    target.password = randomPwd // se re-hashea en el pre('save')
    target.avatar = ''
    target.description = ''
    target.blocked = true
    await target.save()

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

export const adminToggleUserBlock = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })
    user.blocked = !user.blocked
    await user.save()
    res.json({
      _id: user._id,
      blocked: user.blocked,
      isBlocked: !!user.blocked
    })
  } catch (err) {
    next(err)
  }
}

export const adminUpdateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params
    const { role } = req.body
    const valid = ['user', 'admin']
    if (!valid.includes(role))
      return res.status(400).json({ message: 'Rol inválido' })

    if (String(req.user._id) === String(id) && role !== 'admin') {
      return res
        .status(400)
        .json({ message: 'No puedes degradarte a ti mismo' })
    }

    const updated = await User.findByIdAndUpdate(id, { role }, { new: true })
      .select('_id name email role')
      .lean()
    if (!updated)
      return res.status(404).json({ message: 'Usuario no encontrado' })
    res.json(updated)
  } catch (err) {
    next(err)
  }
}
