// Servicio de pagos: lógica de negocio para registrar y consultar pagos
const paymentRepo = require('../repositories/payment.repository')
const { AppError } = require('../utils/AppError')

class PaymentService {

  /**
   * Registra uno o varios pagos para un movimiento (soporta split de pago)
   * @param {function} t - Función de traducción
   * @param {number} id_company - ID de la empresa
   * @param {number} id_user - ID del usuario que registra
   * @param {object} data - { id_movement, payments: Array<{ payment_method, amount }> }
   * @returns {object} { success, message, data: { payment_count } }
   */
  async recordPayments(t, id_company, id_user, { id_movement, payments }) {
    if (!payments || !Array.isArray(payments) || payments.length === 0) {
      throw new AppError(400, t('server.payment.invalidData'))
    }

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
      message: t('server.payment.recorded'),
      data: {
        payment_count: created.length
      }
    }
  }

  /**
   * Obtiene los pagos de un movimiento
   * @param {number} id_movement - ID del movimiento
   * @param {number} id_company - ID de la empresa
   * @returns {object} { success, data }
   */
  async getPayments(id_movement, id_company) {
    const payments = await paymentRepo.getPaymentsByMovement(id_movement)
    return {
      success: true,
      data: payments
    }
  }
}

module.exports = new PaymentService()
