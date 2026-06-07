const authService = require('../services/auth.service')

class AuthController {

  async login(req, res, next) {
    try {
      const { tax_id, username, password } = req.body
      const ip_address = req.headers['x-forwarded-for'] || req.ip || '0.0.0.0'

      const result = await authService.login(req.t, { tax_id, username, password, ip_address })
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  me(req, res) {
    res.json({ success: true, data: { user: req.user } })
  }
}

module.exports = new AuthController()