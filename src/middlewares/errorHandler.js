// Middleware global de manejo de errores
const { logger } = require('../utils/logger')

/**
 * Middleware que captura errores lanzados con next(err)
 * - Errores operativos (AppError): responde con el código y mensaje específico
 * - Errores internos: registra con Winston y responde 500 genérico
 */
const errorHandler = (err, req, res, next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error:   err.message,
      ...(err.errors && { errors: err.errors })
    })
  }
  logger.error(err)
  res.status(500).json({ success: false, error: 'Internal server error' })
}

module.exports = { errorHandler }   // ← antes exportaba sin destructuring