const paymentRepo = require('../repositories/payment.repository')
const { AppError } = require('../utils/AppError')

class PaymentService {

  async recordPayments(id_company, id_user, { id_movement, payments }) {
    // Validar que movimiento existe
    if (!payments || !Array.isArray(payments) || payments.length === 0) {
      throw new AppError(400, 'Invalid payment data')
    }

    // Crear registros de pago
    const paymentRecords = payments.map(p => ({
      id_company,
      id_movement,
      payment_method: p.payment_method,
      amount: p.amount,
      payment_date: new Date(),
      id_user
    }))

    const created = await paymentRepo.createPayments(paymentRecords)

    return {
      success: true,
      message: 'Payments recorded successfully',
      data: {
        payment_count: created.length
      }
    }
  }

  async getPayments(id_movement, id_company) {
    const payments = await paymentRepo.getPaymentsByMovement(id_movement)
    return {
      success: true,
      data: payments
    }
  }
}

module.exports = new PaymentService()
