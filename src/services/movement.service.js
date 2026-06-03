const movementRepo = require('../repositories/movement.repository')
const { AppError } = require('../utils/AppError')

class MovementService {

  async recordEntry(id_company, id_user, { license_plate, type }) {
    // Buscar vehículo
    const vehicle = await movementRepo.findByLicensePlate(license_plate, id_company)
    if (!vehicle) {
      throw new AppError(404, 'Vehicle not found')
    }

    // Verificar si ya está adentro
    const activeMovement = await movementRepo.findActiveMovement(vehicle.id_vehicle)
    if (activeMovement) {
      throw new AppError(409, 'Vehicle is already inside')
    }

    // Obtener tarifa
    const rate = await movementRepo.getActiveRateByType(type, id_company)
    if (!rate) {
      throw new AppError(400, 'No active rate for this vehicle type')
    }

    // Crear movimiento
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
      message: 'Entry recorded successfully',
      data: {
        id_movement: movement.id_movement,
        license_plate: vehicle.license_plate,
        entry_date: movement.entry_date
      }
    }
  }

  async recordExit(id_company, id_user, { license_plate }) {
    // Buscar vehículo
    const vehicle = await movementRepo.findByLicensePlate(license_plate, id_company)
    if (!vehicle) {
      throw new AppError(404, 'Vehicle not found')
    }

    // Buscar movimiento activo
    const movement = await movementRepo.findActiveMovement(vehicle.id_vehicle)
    if (!movement) {
      throw new AppError(404, 'No active entry for this vehicle')
    }

    // Obtener tarifa
    const rate = await movementRepo.getActiveRateByType(vehicle.type, id_company)
    if (!rate) {
      throw new AppError(400, 'No active rate available')
    }

    // Calcular total (básico, puede expandirse)
    const exitDate = new Date()
    const minutes = Math.floor((exitDate - movement.entry_date) / 60000)
    const total = minutes * Number(rate.minute_rate)

    // Actualizar movimiento
    await movementRepo.updateMovement(movement.id_movement, id_company, {
      exit_date: exitDate,
      id_user_exit: id_user,
      total_to_pay: total,
      status: 'completed'
    })

    return {
      success: true,
      message: 'Exit recorded successfully',
      data: {
        id_movement: movement.id_movement,
        license_plate,
        exit_date: exitDate,
        total_to_pay: total
      }
    }
  }

  async getDetail(id_movement, id_company) {
    const movement = await movementRepo.findById(id_movement, id_company)
    if (!movement) {
      throw new AppError(404, 'Movement not found')
    }
    return {
      success: true,
      data: movement
    }
  }

  async getHistory(id_vehicle, id_company, limit = 50, offset = 0) {
    const history = await movementRepo.getMovementHistory(id_vehicle, limit, offset)
    return {
      success: true,
      data: history
    }
  }
}

module.exports = new MovementService()
