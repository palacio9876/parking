const AppError = require('../utils/AppError')
const logger = require('../utils/logger')

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message })
  }
  logger.error(err)
  res.status(500).json({ error: 'Error interno del servidor' })
}

module.exports = errorHandler