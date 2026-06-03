const allowedVehicleTypes = new Set(['car', 'motorcycle', 'bicycle'])

function toSafeInt(value, { min = 0, max = 100000, fallback = 0 } = {}) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  const i = Math.trunc(n)
  if (i < min) return min
  if (i > max) return max
  return i
}

function toSafeLike(value, { uppercase = true } = {}) {
  if (typeof value !== 'string') return null
  const v = uppercase ? value.toUpperCase() : value
  const escaped = v.replace(/[%_]/g, ch => `\\${ch}`)
  return `%${escaped}%`
}

function toSafeVehicleType(value) {
  if (typeof value !== 'string') return null
  const v = value.toLowerCase()
  return allowedVehicleTypes.has(v) ? v : null
}

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