// Controlador de autenticación: maneja las solicitudes de login y consulta de sesión
const authService = require('../services/auth.service')

class AuthController {

  /**
   * POST /api/auth/login
   * Inicia sesión con NIT de empresa, usuario y contraseña
   * @param {object} req.body - { tax_id, username, password }
   */
  async login(req, res, next) {
    try {
      const { tax_id, username, password } = req.body
      const ip_address = req.headers['x-forwarded-for'] || req.ip || '0.0.0.0'

      const result = await authService.login({ tax_id, username, password, ip_address })
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/auth/me
   * Devuelve la información del usuario autenticado
   */
  me(req, res) {
    res.json({ success: true, data: { user: req.user } })
  }
}

module.exports = new AuthController()