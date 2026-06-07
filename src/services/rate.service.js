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

  async createOrUpdate(t, id_company, data) {
    // Validar según modo de cobro
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

    // Desactivar tarifa anterior
    await rateRepo.deactivateRate(data.vehicle_type, id_company)

    // Crear nueva
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
