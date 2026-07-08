// Servicio de movimientos: lógica de negocio para entradas y salidas de vehículos
const movementRepo = require('../repositories/movement.repository')
const vehicleRepo = require('../repositories/vehicle.repository')
const { AppError } = require('../utils/AppError')

class MovementService {

  /**
   * Registra la entrada de un vehículo al parqueadero
   * @param {function} t - Función de traducción
   * @param {number} id_company - ID de la empresa
   * @param {number} id_user - ID del usuario que registra
   * @param {object} data - { license_plate, type }
   * @returns {object} { success, message, data: { id_movement, license_plate, entry_date } }
   */
  async recordEntry(t, id_company, id_user, { license_plate, type }) {
    let vehicle = await movementRepo.findByLicensePlate(license_plate, id_company)
    if (!vehicle) {
      vehicle = await vehicleRepo.create({
        id_company,
        license_plate,
        type,
        color: ''
      })
    }

    const activeMovement = await movementRepo.findActiveMovement(vehicle.id_vehicle)
    if (activeMovement) {
      throw new AppError(409, t('server.movement.alreadyInside'))
    }

    const rate = await movementRepo.getActiveRateByType(type, id_company)
    if (!rate) {
      throw new AppError(400, t('server.movement.noActiveRate'))
    }

    const movement = await movementRepo.createMovement({
      id_company,
      id_vehicle: vehicle.id_vehicle,
      entry_date: new Date(),
      id_rate: rate.id_rate,
      id_user_entry: id_user,
      status: 'active'
    })

    return {
      success: true,
      message: t('server.movement.entryRecorded'),
      data: {
        id_movement: movement.id_movement,
        license_plate: vehicle.license_plate,
        entry_date: movement.entry_date
      }
    }
  }

  /**
   * Registra la salida de un vehículo y calcula el total a pagar
   * @param {function} t - Función de traducción
   * @param {number} id_company - ID de la empresa
   * @param {number} id_user - ID del usuario que registra
   * @param {object} data - { license_plate }
   * @returns {object} { success, message, data: { id_movement, license_plate, exit_date, total_to_pay } }
   */
  async recordExit(t, id_company, id_user, { license_plate }) {
    const vehicle = await movementRepo.findByLicensePlate(license_plate, id_company)
    if (!vehicle) {
      throw new AppError(404, t('server.movement.vehicleNotFound'))
    }

    const movement = await movementRepo.findActiveMovement(vehicle.id_vehicle)
    if (!movement) {
      throw new AppError(404, t('server.movement.noActiveEntry'))
    }

    const rate = await movementRepo.getActiveRateByType(vehicle.type, id_company)
    if (!rate) {
      throw new AppError(400, t('server.movement.noRateAvailable'))
    }

    const exitDate = new Date()
    const minutes = Math.floor((exitDate - movement.entry_date) / 60000)
    const total = minutes * Number(rate.minute_rate)

    await movementRepo.updateMovement(movement.id_movement, id_company, {
      exit_date: exitDate,
      id_user_exit: id_user,
      total_to_pay: total,
      status: 'completed'
    })

    return {
      success: true,
      message: t('server.movement.exitRecorded'),
      data: {
        id_movement: movement.id_movement,
        license_plate,
        exit_date: exitDate,
        total_to_pay: total
      }
    }
  }

  /**
   * Obtiene el detalle de un movimiento
   * @param {function} t - Función de traducción
   * @param {number} id_movement - ID del movimiento
   * @param {number} id_company - ID de la empresa
   * @returns {object} { success, data }
   */
  async getDetail(t, id_movement, id_company) {
    const movement = await movementRepo.findById(id_movement, id_company)
    if (!movement) {
      throw new AppError(404, t('server.movement.notFound'))
    }
    return {
      success: true,
      data: movement
    }
  }

  /**
   * Obtiene el historial de movimientos de un vehículo
   * @param {number} id_vehicle - ID del vehículo
   * @param {number} id_company - ID de la empresa
   * @param {number} limit - Límite de resultados
   * @param {number} offset - Desplazamiento
   * @returns {object} { success, data }
   */
  async getHistory(id_vehicle, id_company, limit = 50, offset = 0) {
    const history = await movementRepo.getMovementHistory(id_vehicle, limit, offset)
    return {
      success: true,
      data: history
    }
  }
}

module.exports = new MovementService()
