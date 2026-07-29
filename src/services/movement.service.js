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
  async recordEntry(id_company, id_user, { license_plate, type }) {
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
      throw new AppError(409, 'El vehículo ya se encuentra dentro')
    }

    const rate = await movementRepo.getActiveRateByType(type, id_company)
    if (!rate) {
      throw new AppError(400, 'No hay tarifa activa para este tipo de vehículo')
    }

    const movement = await movementRepo.createMovement({
      id_company,
      id_vehicle: vehicle.id_vehicle,
      entry_date: new Date(),
      id_rate: rate.id_rate,
      id_user_entry: id_user,
      status: 'activo'
    })

    return {
      success: true,
      message: 'Entrada registrada exitosamente',
      data: {
        id_movement: movement.id_movement,
        license_plate: vehicle.license_plate,
        type: vehicle.type,
        entry_date: movement.entry_date,
        minute_rate: Number(rate.minute_rate),
        hourly_rate: Number(rate.hourly_rate),
        full_day_rate: Number(rate.full_day_rate)
      }
    }
  }

  /**
   * Calcula el total a pagar sin registrar la salida ni cambiar el estado
   * @param {number} id_company - ID de la empresa
   * @param {object} data - { license_plate }
   * @returns {object} { success, message, data: { id_movement, license_plate, exit_date, total_to_pay, minute_rate } }
   */
  async calculateExit(id_company, { license_plate }) {
    const vehicle = await movementRepo.findByLicensePlate(license_plate, id_company)
    if (!vehicle) {
      throw new AppError(404, 'Vehículo no encontrado')
    }

    const movement = await movementRepo.findActiveMovement(vehicle.id_vehicle)
    if (!movement) {
      throw new AppError(404, 'No hay entrada activa para este vehículo')
    }

    const rate = await movementRepo.getActiveRateByType(vehicle.type, id_company)
    if (!rate) {
      throw new AppError(400, 'No hay tarifa activa disponible')
    }

    const exitDate = new Date()
    const minutes = Math.floor((exitDate - movement.entry_date) / 60000)
    const total = minutes * Number(rate.minute_rate)

    return {
      success: true,
      message: 'Cálculo realizado exitosamente',
      data: {
        id_movement: movement.id_movement,
        id_vehicle: vehicle.id_vehicle,
        license_plate,
        type: vehicle.type,
        entry_date: movement.entry_date,
        exit_date: exitDate,
        total_to_pay: total,
        minute_rate: Number(rate.minute_rate),
        hourly_rate: Number(rate.hourly_rate),
        full_day_rate: Number(rate.full_day_rate)
      }
    }
  }

  /**
   * Registra la salida de un vehículo y calcula el total a pagar
   * @param {number} id_company - ID de la empresa
   * @param {number} id_user - ID del usuario que registra
   * @param {object} data - { license_plate }
   * @returns {object} { success, message, data: { id_movement, license_plate, exit_date, total_to_pay } }
   */
  async recordExit(id_company, id_user, { license_plate }) {
    const vehicle = await movementRepo.findByLicensePlate(license_plate, id_company)
    if (!vehicle) {
      throw new AppError(404, 'Vehículo no encontrado')
    }

    const movement = await movementRepo.findActiveMovement(vehicle.id_vehicle)
    if (!movement) {
      throw new AppError(404, 'No hay entrada activa para este vehículo')
    }

    const rate = await movementRepo.getActiveRateByType(vehicle.type, id_company)
    if (!rate) {
      throw new AppError(400, 'No hay tarifa activa disponible')
    }

    const exitDate = new Date()
    const minutes = Math.floor((exitDate - movement.entry_date) / 60000)
    const total = minutes * Number(rate.minute_rate)

    await movementRepo.updateMovement(movement.id_movement, id_company, {
      exit_date: exitDate,
      id_user_exit: id_user,
      total_to_pay: total,
      status: 'completado'
    })

    return {
      success: true,
      message: 'Salida registrada exitosamente',
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
  async getDetail(id_movement, id_company) {
    const movement = await movementRepo.findById(id_movement, id_company)
    if (!movement) {
      throw new AppError(404, 'Movimiento no encontrado')
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
