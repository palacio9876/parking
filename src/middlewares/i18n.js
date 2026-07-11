function i18nMiddleware(req, res, next) {
  req.t = (key, ...args) => {
    // Return key with placeholder replacement for backward compatibility
    let value = key
    if (args.length) {
      args.forEach((arg, i) => {
        value = value.replace(new RegExp(`\\{\\{${i}\\}\\}`, 'g'), arg)
      })
    }
    return value
  }
  next()
}
module.exports = { i18nMiddleware }
