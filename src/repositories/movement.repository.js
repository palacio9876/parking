const { Movement, Vehicle, Rate, User } = require('../models')
const { Op } = require('sequelize')

class MovementRepository {

  findByLicensePlate(license_plate, id_company, excludeExitNull = false) {
    const where = { id_company }
    if (excludeExitNull) {
      where.exit_date = null
    }
    return Vehicle.findOne({
      where: {
        license_plate,
        id_company
      }
    })
  }

  findActiveMovement(id_vehicle) {
    return Movement.findOne({
      where: { id_vehicle, exit_date: null }
    })
  }

  findById(id_movement, id_company) {
    return Movement.findOne({
      where: { id_movement, id_company }
    })
  }

  async createMovement(data) {
    return Movement.create(data)
  }

  async updateMovement(id_movement, id_company, updates) {
    const [affectedRows] = await Movement.update(updates, {
      where: { id_movement, id_company }
    })
    return affectedRows
  }

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
