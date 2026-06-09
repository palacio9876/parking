// Repositorio de movimientos: operaciones sobre entradas, salidas y tarifas activas
const { Movement, Vehicle, Rate, User } = require('../models')
const { Op } = require('sequelize')

class MovementRepository {

  /**
   * Busca un vehículo por placa dentro de una empresa
   * @param {string} license_plate - Placa del vehículo
   * @param {number} id_company - ID de la empresa
   * @param {boolean} excludeExitNull - Si true filtra por exit_date = null (no usado realmente aquí)
   * @returns {Promise<object|null>}
   */
  findByLicensePlate(license_plate, id_company, excludeExitNull = false) {
    return Vehicle.findOne({
      where: { license_plate, id_company }
    })
  }

  /**
   * Busca un movimiento activo (sin fecha de salida) para un vehículo
   * @param {number} id_vehicle - ID del vehículo
   * @returns {Promise<object|null>}
   */
  findActiveMovement(id_vehicle) {
    return Movement.findOne({
      where: { id_vehicle, exit_date: null }
    })
  }

  /**
   * Busca un movimiento por ID dentro de una empresa
   * @param {number} id_movement - ID del movimiento
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<object|null>}
   */
  findById(id_movement, id_company) {
    return Movement.findOne({
      where: { id_movement, id_company }
    })
  }

  /**
   * Crea un nuevo movimiento (entrada de vehículo)
   * @param {object} data - Datos del movimiento
   * @returns {Promise<object>} Movimiento creado
   */
  async createMovement(data) {
    return Movement.create(data)
  }

  /**
   * Actualiza un movimiento (ej. al registrar salida)
   * @param {number} id_movement - ID del movimiento
   * @param {number} id_company - ID de la empresa
   * @param {object} updates - Campos a actualizar
   * @returns {Promise<number>} Filas afectadas
   */
  async updateMovement(id_movement, id_company, updates) {
    const [affectedRows] = await Movement.update(updates, {
      where: { id_movement, id_company }
    })
    return affectedRows
  }

  /**
   * Obtiene la tarifa activa más reciente para un tipo de vehículo
   * @param {string} vehicle_type - Tipo de vehículo
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<object|null>}
   */
  getActiveRateByType(vehicle_type, id_company) {
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
   * Obtiene el historial de movimientos de un vehículo
   * @param {number} id_vehicle - ID del vehículo
   * @param {number} limit - Límite de resultados
   * @param {number} offset - Desplazamiento
   * @returns {Promise<Array>}
   */
  async getMovementHistory(id_vehicle, limit, offset) {
    return Movement.findAll({
      where: { id_vehicle },
      order: [['entry_date', 'DESC']],
      limit,
      offset
    })
  }
}

module.exports = new MovementRepository()
