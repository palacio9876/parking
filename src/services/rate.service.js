const rateRepo = require('../repositories/rate.repository')
const { AppError } = require('../utils/AppError')

class RateService {

  async getCurrent(id_company) {
    const rates = await rateRepo.findAllActiveByCompany(id_company)
    return {
      success: true,
      data: rates
    }
  }

  async createOrUpdate(id_company, data) {
    // Validar según modo de cobro
    const { billing_mode, hourly_rate, minute_rate, full_day_rate } = data

    if (billing_mode === 'minute' && !minute_rate) {
      throw new AppError(400, 'minute_rate required for minute billing')
    }
    if (billing_mode === 'hour' && !hourly_rate) {
      throw new AppError(400, 'hourly_rate required for hour billing')
    }
    if (billing_mode === 'day' && !full_day_rate) {
      throw new AppError(400, 'full_day_rate required for day billing')
    }
    if (billing_mode === 'mixed' && (!hourly_rate || !minute_rate || !full_day_rate)) {
      throw new AppError(400, 'All rates required for mixed billing')
    }

    // Desactivar tarifa anterior
    await rateRepo.deactivateRate(data.vehicle_type, id_company)

    // Crear nueva
    const rate = await rateRepo.createRate({
      id_company,
      ...data
    })

    return {
      success: true,
      message: 'Rate updated successfully',
      data: {
        id_rate: rate.id_rate
      }
    }
  }
}

module.exports = new RateService()
