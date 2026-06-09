// Middleware de internacionalización que inyecta req.t en cada solicitud
const i18n = require('../utils/i18n')

/**
 * Resuelve una clave de traducción para la solicitud actual
 * Soporta placeholders {{0}}, {{1}}, etc.
 * @param {object} req - Objeto de solicitud Express
 * @param {string} key - Clave de traducción
 * @param {...string} args - Valores para reemplazar placeholders
 * @returns {string} Texto traducido
 */
function t(req, key, ...args) {
  const lang = i18n.getLang(req)
  let value = i18n.t(lang, key)
  if (value === undefined || value === null) return key
  if (args.length) {
    args.forEach((arg, i) => {
      value = value.replace(new RegExp(`\\{\\{${i}\\}\\}`, 'g'), arg)
    })
  }
  return value
}

/**
 * Middleware que agrega la función req.t() para traducciones
 */
function i18nMiddleware(req, res, next) {
  req.t = (key, ...args) => t(req, key, ...args)
  next()
}

module.exports = { i18nMiddleware }
