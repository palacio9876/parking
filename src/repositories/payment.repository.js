// Repositorio de pagos: operaciones sobre los cobros realizados
const { Payment, Movement } = require('../models')

class PaymentRepository {

  /**
   * Busca pagos por movimiento y empresa
   * @param {number} id_movement - ID del movimiento
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<Array>}
   */
  findByMovement(id_movement, id_company) {
    return Payment.findAll({
      where: { id_movement, id_company }
    })
  }

  /**
   * Crea múltiples pagos en lote (para split de métodos de pago)
   * @param {Array} payments - Lista de objetos de pago
   * @returns {Promise<Array>} Pagos creados
   */
  async createPayments(payments) {
    return Payment.bulkCreate(payments)
  }

  /**
   * Obtiene todos los pagos de un movimiento
   * @param {number} id_movement - ID del movimiento
   * @returns {Promise<Array>}
   */
  async getPaymentsByMovement(id_movement) {
    return Payment.findAll({
      where: { id_movement }
    })
  }

  /**
   * Obtiene la suma total pagada de un movimiento
   * @param {number} id_movement - ID del movimiento
   * @returns {Promise<number>}
   */
  getTotalPaid(id_movement) {
    return Payment.sum('amount', {
      where: { id_movement }
    })
  }
}

module.exports = new PaymentRepository()
