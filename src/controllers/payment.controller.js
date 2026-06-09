// Controlador de pagos: registro de pagos para movimientos completados
const paymentService = require('../services/payment.service')

class PaymentController {

  /**
   * POST /api/payments/bulk
   * Registra uno o varios pagos para un movimiento
   */
  async recordPayments(req, res, next) {
    try {
      const result = await paymentService.recordPayments(
        req.t,
        req.user.id_company,
        req.user.id_user,
        req.body
      )
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/payments/:id
   * Obtiene los pagos de un movimiento
   */
  async getPayments(req, res, next) {
    try {
      const { id } = req.params
      const result = await paymentService.getPayments(id, req.user.id_company)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new PaymentController()
