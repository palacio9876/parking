// Middlewares de autenticación y autorización usando JWT
const jwt = require('jsonwebtoken')
const { AppError } = require('../utils/AppError')

/**
 * Middleware que verifica que la solicitud tenga un token JWT válido
 * Extrae y decodifica el token del header Authorization: Bearer <token>
 * @param {object} req - Objeto de solicitud Express (se inyecta req.user)
 * @param {object} res - Objeto de respuesta Express
 * @param {function} next - Función next de Express
 */
const auth = (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'No token provided'))
  }
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET)
    next()
  } catch {
    next(new AppError(401, 'Invalid or expired token'))
  }
}

/**
 * Middleware que restringe el acceso solo a usuarios con rol 'admin'
 * Debe usarse después del middleware auth
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return next(new AppError(403, 'Admin access required'))
  }
  next()
}

module.exports = { auth, requireAdmin }