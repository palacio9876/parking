// Repositorio de vehículos: operaciones CRUD sobre el registro de vehículos
const { Vehicle, Movement, Payment } = require('../models')
const { Op } = require('sequelize')

class VehicleRepository {

  /**
   * Obtiene todos los vehículos de una empresa con su estado (activo/inactivo)
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<Array>} Lista de vehículos enriquecida con campo status
   */
  async findAllByCompany(id_company) {
    const vehicles = await Vehicle.findAll({
      where: { id_company },
      order: [['registration_date', 'DESC']],
      attributes: ['id_vehicle', 'license_plate', 'type', 'color', 'model', 'registration_date']
    })

    // Agrega el campo calculado 'status' basado en si tiene un movimiento activo
    const enriched = await Promise.all(vehicles.map(async (v) => {
      const active = await Movement.count({ where: { id_vehicle: v.id_vehicle, exit_date: null } })
      return {
        ...v.get(),
        status: active > 0 ? 'activo' : 'inactive'
      }
    }))

    return enriched
  }

  /**
   * Busca un vehículo por ID
   * @param {number} id_vehicle - ID del vehículo
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<object|null>}
   */
  findById(id_vehicle, id_company) {
    return Vehicle.findOne({
      where: { id_vehicle, id_company }
    })
  }

  /**
   * Busca un vehículo por placa
   * @param {string} license_plate - Placa del vehículo
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<object|null>}
   */
  findByLicensePlate(license_plate, id_company) {
    return Vehicle.findOne({
      where: { license_plate, id_company }
    })
  }

  /**
   * Busca un vehículo por placa excluyendo un ID (para validar unicidad al actualizar)
   * @param {string} license_plate - Placa del vehículo
   * @param {number} id_company - ID de la empresa
   * @param {number} id_vehicle - ID a excluir
   * @returns {Promise<object|null>}
   */
  findByLicensePlateExcluding(license_plate, id_company, id_vehicle) {
    return Vehicle.findOne({
      where: {
        license_plate,
        id_company,
        id_vehicle: { [Op.ne]: id_vehicle }
      }
    })
  }

  /**
   * Crea un nuevo vehículo
   * @param {object} params - { id_company, license_plate, type, color, model }
   * @returns {Promise<object>}
   */
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

  /**
   * Actualiza un vehículo
   * @param {number} id_vehicle - ID del vehículo
   * @param {number} id_company - ID de la empresa
   * @param {object} updates - Campos a actualizar
   * @returns {Promise<number>} Filas afectadas
   */
  async update(id_vehicle, id_company, updates) {
    const [affectedRows] = await Vehicle.update(updates, {
      where: { id_vehicle, id_company }
    })
    return affectedRows
  }

  /**
   * Elimina un vehículo (borrado físico)
   * @param {number} id_vehicle - ID del vehículo
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<number>} Filas eliminadas
   */
  async delete(id_vehicle, id_company) {
    const deletedRows = await Vehicle.destroy({
      where: { id_vehicle, id_company }
    })
    return deletedRows
  }

  /**
   * Cuenta los movimientos activos (sin salida) de un vehículo
   * @param {number} id_vehicle - ID del vehículo
   * @returns {Promise<number>}
   */
  countActiveMovements(id_vehicle) {
    return Movement.count({
      where: { id_vehicle, exit_date: null }
    })
  }

  /**
   * Cuenta el total de movimientos de un vehículo
   * @param {number} id_vehicle - ID del vehículo
   * @returns {Promise<number>}
   */
  countMovements(id_vehicle) {
    return Movement.count({
      where: { id_vehicle }
    })
  }

  /**
   * Obtiene un vehículo con su estado calculado (active/inactive)
   * @param {number} id_vehicle - ID del vehículo
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<object|null>}
   */
  async getVehicleWithStatus(id_vehicle, id_company) {
    const vehicle = await Vehicle.findOne({
      where: { id_vehicle, id_company }
    })
    if (!vehicle) return null

    const activeMovements = await this.countActiveMovements(id_vehicle)
    return {
      ...vehicle.get(),
      status: activeMovements > 0 ? 'activo' : 'inactive'
    }
  }

  /**
   * Obtiene el historial de movimientos de un vehículo
   * @param {number} id_vehicle - ID del vehículo
   * @param {number} limit - Límite de resultados
   * @param {number} offset - Desplazamiento
   * @returns {Promise<Array>}
   */
  async getVehicleHistory(id_vehicle, limit = 50, offset = 0) {
    const movements = await Movement.findAll({
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
        },
        {
          association: 'payments',
          attributes: ['amount']
        }
      ]
    })

    return movements.map((movement) => {
      const data = movement.toJSON()
      const payments = Array.isArray(data.payments) ? data.payments : []
      const total_paid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)

      return {
        id_movement: data.id_movement,
        entry_date: data.entry_date,
        exit_date: data.exit_date,
        total_to_pay: data.total_to_pay != null ? Number(data.total_to_pay) : 0,
        status: data.status,
        total_paid,
        payments: payments.length,
        rate: data.rate
      }
    })
  }
}

module.exports = new VehicleRepository()
