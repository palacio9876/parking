// Servicio de tarifas: lógica de negocio para gestionar tarifas por tipo de vehículo
const rateRepo = require('../repositories/rate.repository')
const { AppError } = require('../utils/AppError')

class RateService {

  /**
   * Obtiene todas las tarifas activas de una empresa
   * @param {number} id_company - ID de la empresa
   * @returns {object} { success, data }
   */
  async getCurrent(id_company) {
    const rates = await rateRepo.findAllActiveByCompany(id_company)
    return {
      success: true,
      data: rates
    }
  }

  /**
   * Crea o actualiza una tarifa: desactiva la anterior y crea una nueva
   * @param {function} t - Función de traducción
   * @param {number} id_company - ID de la empresa
   * @param {object} data - Datos de la tarifa (vehicle_type, hourly_rate, minute_rate, etc.)
   * @returns {object} { success, message, data: { id_rate } }
   */
  async createOrUpdate(id_company, data) {
    const { billing_mode, hourly_rate, minute_rate, full_day_rate } = data

    if (billing_mode === 'minuto' && !minute_rate) {
      throw new AppError(400, 'tarifa_por_minuto requerida para cobro por minuto')
    }
    if (billing_mode === 'hora' && !hourly_rate) {
      throw new AppError(400, 'tarifa_por_hora requerida para cobro por hora')
    }
    if (billing_mode === 'dia' && !full_day_rate) {
      throw new AppError(400, 'tarifa_por_día requerida para cobro por día')
    }
    if (billing_mode === 'mixto' && (!hourly_rate || !minute_rate || !full_day_rate)) {
      throw new AppError(400, 'Todas las tarifas requeridas para cobro mixto')
    }

    // Desactivar tarifa anterior para este tipo de vehículo
    await rateRepo.deactivateRate(data.vehicle_type, id_company)

    const rate = await rateRepo.createRate({
      id_company,
      ...data
    })

    return {
      success: true,
      message: 'Tarifa actualizada exitosamente',
      data: {
        id_rate: rate.id_rate
      }
    }
  }
}

module.exports = new RateService()
