const { Movement, Payment, CompanySetting, Vehicle, Shift, User } = require('../models')
const { Op, fn, col, literal } = require('sequelize')

class ReportRepository {

  async getKPIs(id_company, from, to) {
    const result = await Payment.findOne({
      where: {
        id_company,
        payment_date: { [Op.between]: [`${from} 00:00:00`, `${to} 23:59:59`] }
      },
      attributes: [
        [fn('SUM', col('amount')), 'income'],
        [fn('COUNT', col('id_payment')), 'tickets']
      ],
      raw: true
    })
    return result
  }

  async getActiveCount(id_company) {
    return Movement.count({ where: { id_company, exit_date: null } })
  }

  async getCapacity(id_company) {
    return CompanySetting.findOne({
      where: { id_company },
      attributes: ['car_total_capacity', 'motorcycle_total_capacity', 'bicycle_total_capacity'],
      raw: true
    })
  }

  async getIncomeByDay(id_company, from, to, paymentMethod) {
    const where = {
      id_company,
      payment_date: { [Op.between]: [`${from} 00:00:00`, `${to} 23:59:59`] }
    }
    if (paymentMethod) where.payment_method = paymentMethod

    return Payment.findAll({
      where,
      attributes: [
        [fn('DATE', col('payment_date')), 'date'],
        [fn('SUM', col('amount')), 'total']
      ],
      group: [fn('DATE', col('payment_date'))],
      order: [[fn('DATE', col('payment_date')), 'ASC']],
      raw: true
    })
  }

  async getIncomeByMethod(id_company, from, to) {
    return Payment.findAll({
      where: {
        id_company,
        payment_date: { [Op.between]: [`${from} 00:00:00`, `${to} 23:59:59`] }
      },
      attributes: [
        'payment_method',
        [fn('SUM', col('amount')), 'total'],
        [fn('COUNT', col('id_payment')), 'count']
      ],
      group: ['payment_method'],
      raw: true
    })
  }

  async getMovements(id_company, from, to, limit, offset, filters = {}) {
    const where = {
      id_company,
      entry_date: { [Op.between]: [`${from} 00:00:00`, `${to} 23:59:59`] }
    }
    if (filters.status) where.status = filters.status

    const vehicleWhere = {}
    if (filters.type)  vehicleWhere.type = filters.type
    if (filters.plate) vehicleWhere.license_plate = { [Op.like]: `%${filters.plate}%` }

    const { count, rows } = await Movement.findAndCountAll({
      where,
      order: [['entry_date', 'DESC']],
      limit,
      offset,
      include: [{
        association: 'vehicle',
        attributes: ['license_plate', 'type'],
        where: Object.keys(vehicleWhere).length ? vehicleWhere : undefined,
        required: !!Object.keys(vehicleWhere).length
      }]
    })

    return {
      data: rows.map(r => ({
        id: r.id_movement,
        license_plate: r.vehicle?.license_plate,
        type:          r.vehicle?.type,
        entry_date:    r.entry_date,
        exit_date:     r.exit_date,
        status:        r.status,
        total_to_pay:  r.total_to_pay
      })),
      total: count
    }
  }

  async getTopPlates(id_company, from, to, limit = 10) {
    return Movement.findAll({
      where: {
        id_company,
        entry_date: { [Op.between]: [`${from} 00:00:00`, `${to} 23:59:59`] }
      },
      attributes: [
        [fn('COUNT', col('Movement.id_movement')), 'visits'],
        [fn('SUM', col('total_to_pay')), 'total']
      ],
      include: [{
        association: 'vehicle',
        attributes: ['license_plate', 'type'],
        required: true
      }],
      group: ['vehicle.id_vehicle'],
      order: [[fn('COUNT', col('Movement.id_movement')), 'DESC']],
      limit,
      raw: true
    })
  }

  async getShifts(id_company, from, to, username) {
    const where = {
      id_company,
      opening_date: { [Op.between]: [`${from} 00:00:00`, `${to} 23:59:59`] }
    }

    return Shift.findAll({
      where,
      order: [['opening_date', 'DESC']],
      include: [{
        association: 'user',
        attributes: ['name', 'username'],
        where: username ? { username: { [Op.like]: `%${username}%` } } : undefined,
        required: !!username
      }]
    })
  }
}

module.exports = new ReportRepository()