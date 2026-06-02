const shiftRepo = require('../repositories/shift.repository')
const { AppError } = require('../utils/AppError')

class ShiftService {

  async openShift(id_company, id_user, { initial_base, opening_observation }) {
    const existing = await shiftRepo.getOpenShift(id_company)
    if (existing) {
      throw new AppError(409, 'There is already an open shift')
    }

    const shift = await shiftRepo.createShift({
      id_company,
      id_user,
      initial_base: Number(initial_base || 0),
      opening_observation,
      opening_date: new Date(),
      status: 'open'
    })

    return { success: true, message: 'Shift opened successfully', data: shift }
  }

  async closeShift(id_company, id_user, { total_cash, total_card, total_qr, closing_observation }) {
    const shift = await shiftRepo.getOpenShift(id_company)
    if (!shift) {
      throw new AppError(404, 'No open shift found')
    }

    const cash    = Number(total_cash  || 0)
    const card    = Number(total_card  || 0)
    const qr      = Number(total_qr    || 0)
    const total_general = cash + card + qr
    const difference    = total_general - Number(shift.initial_base || 0)

    const affectedRows = await shiftRepo.closeShift(shift.id_shift, {
      total_cash:    cash,
      total_card:    card,
      total_qr:      qr,
      total_general,
      difference,
      closing_observation,
      closing_date: new Date(),
      status: 'closed'
    })

    if (!affectedRows) {
      throw new AppError(500, 'Error closing shift')
    }

    return {
      success: true,
      message: 'Shift closed successfully',
      data: {
        shift:      { id_shift: shift.id_shift, user: id_user },
        base:       shift.initial_base,
        userTotals: { cash, card, qr, total: total_general },
        expected:   { cash, card, qr, total: total_general },
        difference,
        stats:      { total: 0, byType: { car: 0, motorcycle: 0, bicycle: 0 } }
      }
    }
  }

  async getCurrent(id_company) {
    const shift = await shiftRepo.getOpenShift(id_company)
    if (!shift) {
      throw new AppError(404, 'No open shift found')
    }
    return { success: true, data: shift }
  }

  async getSummary(id_company) {
    const shift = await shiftRepo.getOpenShift(id_company)
    if (!shift) {
      return { success: true, data: { totals: { cash: 0, card: 0, qr: 0, total: 0 } } }
    }
    return {
      success: true,
      data: { totals: { cash: 0, card: 0, qr: 0, total: 0 }, shift }
    }
  }
}

module.exports = new ShiftService()