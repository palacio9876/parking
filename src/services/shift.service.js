// Servicio de turnos: lógica de negocio para apertura y cierre de caja
const shiftRepo = require('../repositories/shift.repository')
const { AppError } = require('../utils/AppError')

class ShiftService {

  /**
   * Abre un nuevo turno de caja para un operador
   * @param {function} t - Función de traducción
   * @param {number} id_company - ID de la empresa
   * @param {number} id_user - ID del usuario que abre el turno
   * @param {object} data - { initial_base, opening_observation }
   * @returns {object} { success, message, data }
   */
  async openShift(id_company, id_user, { initial_base, opening_observation }) {
    const existing = await shiftRepo.getOpenShift(id_company)
    if (existing) {
      throw new AppError(409, 'Ya hay un turno abierto')
    }

    const shift = await shiftRepo.createShift({
      id_company,
      id_user,
      initial_base: Number(initial_base || 0),
      opening_observation,
      opening_date: new Date(),
      status: 'abierto'
    })

    return { success: true, message: 'Turno abierto exitosamente', data: shift }
  }

  /**
   * Cierra el turno actual registrando totales por método de pago y calculando diferencia
   * @param {function} t - Función de traducción
   * @param {number} id_company - ID de la empresa
   * @param {number} id_user - ID del usuario que cierra
   * @param {object} data - { total_cash, total_card, total_qr, closing_observation }
   * @returns {object} { success, message, data: { shift, base, userTotals, expected, difference, stats } }
   */
  async closeShift(id_company, id_user, { total_cash, total_card, total_qr, closing_observation }) {
    const shift = await shiftRepo.getOpenShift(id_company)
    if (!shift) {
      throw new AppError(404, 'No se encontró un turno abierto')
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
      status: 'cerrado'
    })

    if (!affectedRows) {
      throw new AppError(500, 'Error al cerrar el turno')
    }

    return {
      success: true,
      message: 'Turno cerrado exitosamente',
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

  /**
   * Obtiene el turno actualmente abierto
   * @param {function} t - Función de traducción
   * @param {number} id_company - ID de la empresa
   * @returns {object} { success, data }
   */
  async getCurrent(id_company) {
    const shift = await shiftRepo.getOpenShift(id_company)
    if (!shift) {
      throw new AppError(404, 'No se encontró un turno abierto')
    }
    return { success: true, data: shift }
  }

  /**
   * Obtiene un resumen del turno actual (o valores por defecto si no hay turno abierto)
   * @param {number} id_company - ID de la empresa
   * @returns {object} { success, data: { totals, shift? } }
   */
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