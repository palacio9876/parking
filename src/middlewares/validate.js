// Middleware de validación de datos usando esquemas Zod
const { AppError } = require('../utils/AppError')

/**
 * Crea un middleware que valida req.body contra un esquema Zod
 * Si falla la validación, lanza un AppError 400 con los errores de campo
 * Si pasa, reemplaza req.body con los datos ya parseados/transformados
 * @param {object} schema - Esquema Zod para validar
 * @returns {function} Middleware Express
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    return next(new AppError(400, 'Validation error', true, errors))
  }
  req.body = result.data
  next()
}

module.exports = { validate }