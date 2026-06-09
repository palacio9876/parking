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
  async createOrUpdate(t, id_company, data) {
    const { billing_mode, hourly_rate, minute_rate, full_day_rate } = data

    if (billing_mode === 'minute' && !minute_rate) {
      throw new AppError(400, t('server.rate.minuteRequired'))
    }
    if (billing_mode === 'hour' && !hourly_rate) {
      throw new AppError(400, t('server.rate.hourlyRequired'))
    }
    if (billing_mode === 'day' && !full_day_rate) {
      throw new AppError(400, t('server.rate.dayRequired'))
    }
    if (billing_mode === 'mixed' && (!hourly_rate || !minute_rate || !full_day_rate)) {
      throw new AppError(400, t('server.rate.allRequired'))
    }

    // Desactivar tarifa anterior para este tipo de vehículo
    await rateRepo.deactivateRate(data.vehicle_type, id_company)

    const rate = await rateRepo.createRate({
      id_company,
      ...data
    })

    return {
      success: true,
      message: t('server.rate.updated'),
      data: {
        id_rate: rate.id_rate
      }
    }
  }
}

module.exports = new RateService()
