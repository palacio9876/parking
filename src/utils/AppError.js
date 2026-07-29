// Clase personalizada de error que distingue errores operativos predecibles
// de errores internos del servidor, permitiendo un manejo adecuado en el middleware
class AppError extends Error {
  /**
   * @param {number} statusCode - Código HTTP del error
   * @param {string} message - Mensaje descriptivo del error
   * @param {boolean} isOperational - Indica si es un error operativo (true) o interno (false)
   * @param {object|null} errors - Errores de validación adicionales (ej. campos inválidos)
   */
  constructor(statusCode, message, isOperational = true, errors = null) {
    super(message)
    this.statusCode    = statusCode
    this.isOperational = isOperational
    this.errors        = errors
  }
}

module.exports = { AppError }