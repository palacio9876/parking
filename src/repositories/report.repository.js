// Repositorio de reportes: consultas analíticas para el módulo de informes
const { Movement, Payment, CompanySetting, Vehicle, Shift, User } = require('../models')
const { Op, fn, col, literal } = require('sequelize')

class ReportRepository {

  /**
   * Obtiene KPIs básicos (ingresos y cantidad de tickets) en un rango de fechas
   * @param {number} id_company - ID de la empresa
   * @param {string} from - Fecha inicio (YYYY-MM-DD)
   * @param {string} to - Fecha fin (YYYY-MM-DD)
   * @returns {Promise<object>} { income, tickets }
   */
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

  /**
   * Cuenta los vehículos actualmente dentro del parqueadero
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<number>}
   */
  async getActiveCount(id_company) {
    return Movement.count({ where: { id_company, exit_date: null } })
  }

  /**
   * Obtiene las capacidades del parqueadero
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<object>} { car_total_capacity, motorcycle_total_capacity, bicycle_total_capacity }
   */
  async getCapacity(id_company) {
    return CompanySetting.findOne({
      where: { id_company },
      attributes: ['car_total_capacity', 'motorcycle_total_capacity', 'bicycle_total_capacity'],
      raw: true
    })
  }

  /**
   * Obtiene ingresos agrupados por día en un rango de fechas
   * @param {number} id_company - ID de la empresa
   * @param {string} from - Fecha inicio
   * @param {string} to - Fecha fin
   * @param {string} [paymentMethod] - Filtrar por método de pago
   * @returns {Promise<Array>}
   */
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

  /**
   * Obtiene ingresos agrupados por método de pago
   * @param {number} id_company - ID de la empresa
   * @param {string} from - Fecha inicio
   * @param {string} to - Fecha fin
   * @returns {Promise<Array>}
   */
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

  /**
   * Obtiene movimientos con paginación y filtros (tipo, estado, placa)
   * @param {number} id_company - ID de la empresa
   * @param {string} from - Fecha inicio
   * @param {string} to - Fecha fin
   * @param {number} limit - Límite por página
   * @param {number} offset - Desplazamiento
   * @param {object} filters - { type, status, plate }
   * @returns {Promise<object>} { data: Array, total: number }
   */
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

  /**
   * Obtiene todos los movimientos (sin paginación) para exportación
   * @param {number} id_company
   * @param {string} from
   * @param {string} to
   * @param {object} filters - { type, status, plate }
   * @returns {Promise<Array>}
   */
  async getAllMovements(id_company, from, to, filters = {}) {
    const where = {
      id_company,
      entry_date: { [Op.between]: [`${from} 00:00:00`, `${to} 23:59:59`] }
    }
    if (filters.status) where.status = filters.status

    const vehicleWhere = {}
    if (filters.type)  vehicleWhere.type = filters.type
    if (filters.plate) vehicleWhere.license_plate = { [Op.like]: `%${filters.plate}%` }

    const rows = await Movement.findAll({
      where,
      order: [['entry_date', 'DESC']],
      include: [{
        association: 'vehicle',
        attributes: ['license_plate', 'type'],
        where: Object.keys(vehicleWhere).length ? vehicleWhere : undefined,
        required: !!Object.keys(vehicleWhere).length
      }]
    })

    return rows.map(r => ({
      id: r.id_movement,
      license_plate: r.vehicle?.license_plate,
      type:          r.vehicle?.type,
      entry_date:    r.entry_date,
      exit_date:     r.exit_date,
      status:        r.status,
      total_to_pay:  r.total_to_pay
    }))
  }

  /**
   * Obtiene todas las placas más frecuentes (sin límite) para exportación
   * @param {number} id_company
   * @param {string} from
   * @param {string} to
   * @returns {Promise<Array>}
   */
  async getAllTopPlates(id_company, from, to) {
    const rows = await Movement.findAll({
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
      raw: true
    })
    return rows.map(r => ({
      license_plate: r['vehicle.license_plate'] || r.license_plate,
      type: r['vehicle.type'] || r.type,
      visits: r.visits,
      total: r.total
    }))
  }

  /**
   * Obtiene las placas más frecuentes en un rango de fechas
   * @param {number} id_company - ID de la empresa
   * @param {string} from - Fecha inicio
   * @param {string} to - Fecha fin
   * @param {number} limit - Top N (default 10)
   * @returns {Promise<Array>}
   */
  async getTopPlates(id_company, from, to, limit = 10) {
    const rows = await Movement.findAll({
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
    return rows.map(r => ({
      license_plate: r['vehicle.license_plate'] || r.license_plate,
      type: r['vehicle.type'] || r.type,
      visits: r.visits,
      total: r.total
    }))
  }

  /**
   * Obtiene los turnos (shifts) en un rango de fechas, opcionalmente filtrados por usuario
   * @param {number} id_company - ID de la empresa
   * @param {string} from - Fecha inicio
   * @param {string} to - Fecha fin
   * @param {string} [username] - Nombre de usuario para filtrar
   * @returns {Promise<Array>}
   */
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