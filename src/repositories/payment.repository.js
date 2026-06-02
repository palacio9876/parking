const { Payment, Movement } = require('../models')

class PaymentRepository {

  findByMovement(id_movement, id_company) {
    return Payment.findAll({
      where: { id_movement, id_company }
    })
  }

  async createPayments(payments) {
    return Payment.bulkCreate(payments)
  }

  async getPaymentsByMovement(id_movement) {
    return Payment.findAll({
      where: { id_movement }
    })
  }

  getTotalPaid(id_movement) {
    return Payment.sum('amount', {
      where: { id_movement }
    })
  }
}

module.exports = new PaymentRepository()
