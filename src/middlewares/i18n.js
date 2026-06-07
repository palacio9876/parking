const i18n = require('../utils/i18n')

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

function i18nMiddleware(req, res, next) {
  req.t = (key, ...args) => t(req, key, ...args)
  next()
}

module.exports = { i18nMiddleware }
