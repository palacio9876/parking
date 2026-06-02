const { AppError } = require('../utils/AppError')

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