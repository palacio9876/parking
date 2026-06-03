class AppError extends Error {
  constructor(statusCode, message, isOperational = true, errors = null) {
    super(message)
    this.statusCode    = statusCode
    this.isOperational = isOperational
    this.errors        = errors
  }
}

module.exports = { AppError }