const vehicleRepo = require('../repositories/vehicle.repository')
const { AppError } = require('../utils/AppError')

class VehicleService {

  async getAll(id_company) {
    const vehicles = await vehicleRepo.findAllByCompany(id_company)
    return {
      success: true,
      data: vehicles
    }
  }

  async getById(id_vehicle, id_company) {
    const vehicle = await vehicleRepo.findById(id_vehicle, id_company)
    if (!vehicle) {
      throw new AppError(404, 'Vehicle not found')
    }
    return {
      success: true,
      data: vehicle
    }
  }

  async create(id_company, vehicleData) {
    // Verificar si ya existe vehículo con esa placa
    const existing = await vehicleRepo.findByLicensePlate(vehicleData.license_plate, id_company)
    if (existing) {
      throw new AppError(409, 'A vehicle with this license plate already exists')
    }

    const vehicle = await vehicleRepo.create({
      id_company,
      ...vehicleData
    })

    return {
      success: true,
      message: 'Vehicle created successfully',
      data: {
        id_vehicle: vehicle.id_vehicle
      }
    }
  }

  async update(id_vehicle, id_company, updates) {
    // Verificar que vehículo existe
    const vehicle = await vehicleRepo.findById(id_vehicle, id_company)
    if (!vehicle) {
      throw new AppError(404, 'Vehicle not found')
    }

    // Si actualiza placa, verificar que no exista otra con la misma
    if (updates.license_plate && updates.license_plate !== vehicle.license_plate) {
      const existing = await vehicleRepo.findByLicensePlateExcluding(
        updates.license_plate,
        id_company,
        id_vehicle
      )
      if (existing) {
        throw new AppError(409, 'A vehicle with this license plate already exists')
      }
    }

    const affectedRows = await vehicleRepo.update(id_vehicle, id_company, updates)
    if (affectedRows === 0) {
      throw new AppError(404, 'Vehicle not found')
    }

    return {
      success: true,
      message: 'Vehicle updated successfully'
    }
  }

  async delete(id_vehicle, id_company) {
    // Verificar que vehículo existe
    const vehicle = await vehicleRepo.findById(id_vehicle, id_company)
    if (!vehicle) {
      throw new AppError(404, 'Vehicle not found')
    }

    // Verificar que no tenga movimientos activos
    const activeMovements = await vehicleRepo.countActiveMovements(id_vehicle)
    if (activeMovements > 0) {
      throw new AppError(400, 'Cannot delete vehicle with active movements')
    }

    const deletedRows = await vehicleRepo.delete(id_vehicle, id_company)
    if (deletedRows === 0) {
      throw new AppError(404, 'Vehicle not found')
    }

    return {
      success: true,
      message: 'Vehicle deleted successfully'
    }
  }

  async getHistory(id_vehicle, id_company, limit = 50, offset = 0) {
    // Verificar que vehículo existe y pertenece a la empresa
    const vehicle = await vehicleRepo.findById(id_vehicle, id_company)
    if (!vehicle) {
      throw new AppError(404, 'Vehicle not found')
    }

    const history = await vehicleRepo.getVehicleHistory(id_vehicle, limit, offset)
    return {
      success: true,
      data: history
    }
  }
}

module.exports = new VehicleService()
