const { Movement, Vehicle, User, Rate, Payment } = require('../models')
const { Op, fn, col } = require('sequelize')
const sequelize = require('../config/db')

class DashboardRepository {

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

  async getTodayIncome(id_company) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

      return Movement.findOne({
      where: {
        id_company,
        status: 'completed',
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

  async getTotalActiveUsers(id_company) {
    return User.count({
      where: { id_company, active: true }
    })
  }

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
      }],
      raw: true
    })
  }

  async getMovementCount(id_company) {
    return Movement.count({
      where: { id_company }
    })
  }
}

module.exports = new DashboardRepository()
