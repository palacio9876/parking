const jwt = require('jsonwebtoken')
const { AppError } = require('../utils/AppError')

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

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return next(new AppError(403, 'Admin access required'))
  }
  next()
}

module.exports = { auth, requireAdmin }