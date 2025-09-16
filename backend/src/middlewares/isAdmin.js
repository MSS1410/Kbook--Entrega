export const isAdmin = (req, res, next) => {
  // Debe ejecutarse después de auth, que añade req.user
  if (!req.user)
    return res.status(401).json({ message: 'Acceso no autorizado' })

  if (req.user.role !== 'admin')
    return res
      .status(403)
      .json({ message: 'Requiere privilegios de administrador' })

  next()
}
