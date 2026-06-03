// src/repositories/rate.repository.js
const { Rate } = require('../models')
const { Op } = require('sequelize')

class RateRepository {

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

  findAllActiveByCompany(id_company) {
    return Rate.findAll({
      where: { id_company, active: true },
      order: [['vehicle_type', 'ASC']]
    })
  }

  async createRate(data) {
    return Rate.create({
      ...data,
      effective_from: new Date(),
      active: true
    })
  }

  async deactivateRate(vehicle_type, id_company) {
    const [affectedRows] = await Rate.update(
      { active: false, effective_until: new Date() },
      { where: { id_company, vehicle_type, active: true } }
    )
    return affectedRows
  }
}

module.exports = new RateRepository()