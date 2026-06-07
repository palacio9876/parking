const paymentService = require('../services/payment.service')

class PaymentController {

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
