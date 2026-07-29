// Repositorio de tarifas: operaciones sobre las tarifas activas de cada empresa
const { Rate } = require('../models')
const { Op } = require('sequelize')

class RateRepository {

  /**
   * Busca una tarifa activa por tipo de vehículo
   * @param {string} vehicle_type - Tipo de vehículo
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<object|null>}
   */
  findActiveByType(vehicle_type, id_company) {
    return Rate.findOne({
      where: {
        id_company,
        vehicle_type,
        active: true,
        [Op.or]: [
          { effective_until: null },
          { effective_until: { [Op.gte]: new Date() } }
        ]
      },
      order: [['effective_from', 'DESC']]
    })
  }

  /**
   * Obtiene todas las tarifas activas de una empresa, ordenadas por tipo
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<Array>}
   */
  findAllActiveByCompany(id_company) {
    return Rate.findAll({
      where: { id_company, active: true },
      order: [['vehicle_type', 'ASC']]
    })
  }

  /**
   * Crea una nueva tarifa (marca effective_from y active automáticamente)
   * @param {object} data - Datos de la tarifa
   * @returns {Promise<object>}
   */
  async createRate(data) {
    return Rate.create({
      ...data,
      effective_from: new Date(),
      active: true
    })
  }

  /**
   * Desactiva las tarifas activas de un tipo de vehículo (para reemplazarlas)
   * @param {string} vehicle_type - Tipo de vehículo
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<number>} Filas afectadas
   */
  async deactivateRate(vehicle_type, id_company) {
    const [affectedRows] = await Rate.update(
      { active: false, effective_until: new Date() },
      { where: { id_company, vehicle_type, active: true } }
    )
    return affectedRows
  }
}

module.exports = new RateRepository()