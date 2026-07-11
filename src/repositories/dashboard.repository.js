// Repositorio del dashboard: consultas para la vista principal de estadísticas
const { Movement, Vehicle, User, Rate, Payment } = require('../models')
const { Op, fn, col } = require('sequelize')
const sequelize = require('../config/db')

class DashboardRepository {

  /**
   * Obtiene la cantidad de vehículos activos (dentro) agrupados por tipo
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<Array>} Lista de { type, count }
   */
  async getActiveVehiclesByType(id_company) {
    return Movement.findAll({
      where: { id_company, exit_date: null },
      attributes: [
        'vehicle.type',
        [fn('COUNT', col('id_movement')), 'count']
      ],
      include: [{
        association: 'vehicle',
        attributes: [],
        required: true
      }],
      raw: true,
      group: ['vehicle.type']
    })
  }

  /**
   * Obtiene el ingreso total del día de hoy (movimientos completados)
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<object>} Objeto con { total } o null
   */
  async getTodayIncome(id_company) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

      return Movement.findOne({
      where: {
        id_company,
        status: 'completado',
        exit_date: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      },
      attributes: [
          [fn('SUM', col('total_to_pay')), 'total']
      ],
      raw: true
    })
  }

  /**
   * Cuenta los usuarios activos de una empresa
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<number>}
   */
  async getTotalActiveUsers(id_company) {
    return User.count({
      where: { id_company, active: true }
    })
  }

  /**
   * Obtiene la actividad reciente de movimientos (activos primero, luego por fecha descendente)
   * @param {number} id_company - ID de la empresa
   * @param {number} limit - Límite de resultados
   * @param {number} offset - Desplazamiento para paginación
   * @returns {Promise<Array>}
   */
  async getRecentActivity(id_company, limit, offset) {
    return Movement.findAll({
      where: { id_company },
      order: [
        [sequelize.literal('CASE WHEN exit_date IS NULL THEN 0 ELSE 1 END'), 'ASC'],
        ['entry_date', 'DESC']
      ],
      limit,
      offset,
      attributes: ['id_movement', 'entry_date', 'exit_date', 'status'],
      include: [{
        association: 'vehicle',
        attributes: ['license_plate', 'type'],
        required: true
      }]
    })
  }

  /**
   * Cuenta el total de movimientos de una empresa
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<number>}
   */
  async getMovementCount(id_company) {
    return Movement.count({
      where: { id_company }
    })
  }
}

module.exports = new DashboardRepository()
