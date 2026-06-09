// Funciones de sanitización para validar y limpiar valores de entrada
const allowedVehicleTypes = new Set(['car', 'motorcycle', 'bicycle'])

/**
 * Convierte un valor a entero seguro dentro de un rango
 * @param {*} value - Valor a convertir
 * @param {object} options - Opciones { min, max, fallback }
 * @returns {number} Entero sanitizado
 */
function toSafeInt(value, { min = 0, max = 100000, fallback = 0 } = {}) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  const i = Math.trunc(n)
  if (i < min) return min
  if (i > max) return max
  return i
}

/**
 * Convierte un valor a patrón LIKE seguro escapando caracteres especiales
 * @param {string} value - Valor a convertir
 * @param {object} options - Opciones { uppercase }
 * @returns {string|null} Patrón LIKE o null si es inválido
 */
function toSafeLike(value, { uppercase = true } = {}) {
  if (typeof value !== 'string') return null
  const v = uppercase ? value.toUpperCase() : value
  const escaped = v.replace(/[%_]/g, ch => `\\${ch}`)
  return `%${escaped}%`
}

/**
 * Valida que un tipo de vehículo sea uno de los permitidos
 * @param {string} value - Tipo de vehículo
 * @returns {string|null} Tipo normalizado o null si es inválido
 */
function toSafeVehicleType(value) {
  if (typeof value !== 'string') return null
  const v = value.toLowerCase()
  return allowedVehicleTypes.has(v) ? v : null
}

/**
 * Middleware que sanitiza los filtros de consulta para reportes
 */
function sanitizeReportFilters(req, res, next) {
  try {
    const q = req.query || {}
    const from     = typeof q.from  === 'string' && q.from.length  >= 8 ? q.from  : new Date().toISOString().slice(0, 10)
    const to       = typeof q.to    === 'string' && q.to.length    >= 8 ? q.to    : new Date().toISOString().slice(0, 10)
    const status   = q.status === 'active' ? 'active' : (q.status === 'completed' ? 'completed' : null)
    const type     = toSafeVehicleType(q.type)
    const plateLike= q.plate ? toSafeLike(String(q.plate)) : null
    const page     = toSafeInt(q.page,     { min: 0,  max: 100000, fallback: 0  })
    const pageSize = toSafeInt(q.pageSize, { min: 1,  max: 100,    fallback: 20 })
    const limit    = toSafeInt(q.limit,    { min: 1,  max: 5000,   fallback: 1000 })

    req.sanitized = Object.assign({}, req.sanitized, {
      from, to, status, type, plateLike, page, pageSize, limit
    })
    next()
  } catch (e) {
    return res.status(400).json({ success: false, message: 'Invalid parameters' })
  }
}

/**
 * Crea un middleware que sanitiza un parámetro de ruta como entero positivo
 * @param {string} paramName - Nombre del parámetro de ruta (default 'id')
 * @returns {Function} Middleware Express
 */
function sanitizeIdParam(paramName = 'id') {
  return function (req, res, next) {
    const raw = req.params && req.params[paramName]
    const id  = toSafeInt(raw, { min: 1, max: Number.MAX_SAFE_INTEGER, fallback: 0 })
    if (!id) return res.status(400).json({ success: false, message: `Invalid ${paramName}` })
    req.params[paramName] = id
    next()
  }
}

module.exports = { toSafeInt, toSafeLike, toSafeVehicleType, sanitizeReportFilters, sanitizeIdParam }