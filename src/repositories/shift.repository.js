// Repositorio de turnos: operaciones sobre apertura y cierre de caja
const { Shift } = require('../models')

class ShiftRepository {

  /**
   * Obtiene el turno abierto actual de una empresa
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<object|null>}
   */
  getOpenShift(id_company) {
    return Shift.findOne({
      where: { id_company, status: 'open' }
    })
  }

  /**
   * Crea un nuevo turno
   * @param {object} data - Datos del turno
   * @returns {Promise<object>}
   */
  createShift(data) {
    return Shift.create(data)
  }

  /**
   * Cierra un turno actualizando sus datos
   * @param {number} id_shift - ID del turno
   * @param {object} data - Datos de cierre
   * @returns {Promise<number>} Filas afectadas
   */
  async closeShift(id_shift, data) {
    const [affectedRows] = await Shift.update(data, {
      where: { id_shift }
    })
    return affectedRows
  }

  /**
   * Busca un turno por ID
   * @param {number} id_shift - ID del turno
   * @returns {Promise<object|null>}
   */
  findById(id_shift) {
    return Shift.findOne({ where: { id_shift } })
  }

  /**
   * Busca turnos de una empresa en un rango de fechas
   * @param {number} id_company - ID de la empresa
   * @param {string} from - Fecha inicio
   * @param {string} to - Fecha fin
   * @returns {Promise<Array>}
   */
  findByCompanyAndDateRange(id_company, from, to) {
    const { Op } = require('sequelize')
    return Shift.findAll({
      where: {
        id_company,
        opening_date: { [Op.between]: [from, to] }
      },
      order: [['opening_date', 'DESC']]
    })
  }
}

module.exports = new ShiftRepository()