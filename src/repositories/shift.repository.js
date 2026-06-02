// src/repositories/shift.repository.js
const { Shift } = require('../models')

class ShiftRepository {

  getOpenShift(id_company) {
    return Shift.findOne({
      where: { id_company, status: 'open' }
    })
  }

  createShift(data) {
    return Shift.create(data)
  }

  async closeShift(id_shift, data) {
    const [affectedRows] = await Shift.update(data, {
      where: { id_shift }
    })
    return affectedRows
  }

  findById(id_shift) {
    return Shift.findOne({ where: { id_shift } })
  }

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