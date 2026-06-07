const { Vehicle, Movement } = require('../models')
const { Op } = require('sequelize')

class VehicleRepository {

  async findAllByCompany(id_company) {
    const vehicles = await Vehicle.findAll({
      where: { id_company },
      order: [['registration_date', 'DESC']],
      attributes: ['id_vehicle', 'license_plate', 'type', 'color', 'model', 'registration_date']
    })

    // Add computed status field
    const enriched = await Promise.all(vehicles.map(async (v) => {
      const active = await Movement.count({ where: { id_vehicle: v.id_vehicle, exit_date: null } })
      return {
        ...v.get(),
        status: active > 0 ? 'active' : 'inactive'
      }
    }))

    return enriched
  }

  findById(id_vehicle, id_company) {
    return Vehicle.findOne({
      where: { id_vehicle, id_company }
    })
  }

  findByLicensePlate(license_plate, id_company) {
    return Vehicle.findOne({
      where: { license_plate, id_company }
    })
  }

  findByLicensePlateExcluding(license_plate, id_company, id_vehicle) {
    return Vehicle.findOne({
      where: {
        license_plate,
        id_company,
        id_vehicle: { [Op.ne]: id_vehicle }
      }
    })
  }

  async create({ id_company, license_plate, type, color, model }) {
    const vehicle = await Vehicle.create({
      id_company,
      license_plate,
      type,
      color,
      model,
      registration_date: new Date()
    })
    return vehicle
  }

  async update(id_vehicle, id_company, updates) {
    const [affectedRows] = await Vehicle.update(updates, {
      where: { id_vehicle, id_company }
    })
    return affectedRows
  }

  async delete(id_vehicle, id_company) {
    const deletedRows = await Vehicle.destroy({
      where: { id_vehicle, id_company }
    })
    return deletedRows
  }

  countActiveMovements(id_vehicle) {
    return Movement.count({
      where: { id_vehicle, exit_date: null }
    })
  }

  countMovements(id_vehicle) {
    return Movement.count({
      where: { id_vehicle }
    })
  }

  async getVehicleWithStatus(id_vehicle, id_company) {
    const vehicle = await Vehicle.findOne({
      where: { id_vehicle, id_company }
    })
    if (!vehicle) return null

    const activeMovements = await this.countActiveMovements(id_vehicle)
    return {
      ...vehicle.get(),
      status: activeMovements > 0 ? 'active' : 'inactive'
    }
  }

  async getVehicleHistory(id_vehicle, limit = 50, offset = 0) {
    return Movement.findAll({
      where: { id_vehicle },
      order: [['entry_date', 'DESC']],
      limit,
      offset,
      attributes: [
        'id_movement',
        'entry_date',
        'exit_date',
        'total_to_pay',
        'status'
      ],
      include: [
        {
          association: 'rate',
          attributes: ['vehicle_type', 'hourly_rate', 'minute_rate', 'full_day_rate']
        }
      ]
    })
  }
}

module.exports = new VehicleRepository()
