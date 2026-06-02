// src/middlewares/errorHandler.js
const { logger } = require('../utils/logger')

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