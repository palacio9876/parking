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

  async getById(t, id_vehicle, id_company) {
    const vehicle = await vehicleRepo.findById(id_vehicle, id_company)
    if (!vehicle) {
      throw new AppError(404, t('server.vehicle.notFound'))
    }
    return {
      success: true,
      data: vehicle
    }
  }

  async create(t, id_company, vehicleData) {
    // Verificar si ya existe vehículo con esa placa
    const existing = await vehicleRepo.findByLicensePlate(vehicleData.license_plate, id_company)
    if (existing) {
      throw new AppError(409, t('server.vehicle.alreadyExists'))
    }

    const vehicle = await vehicleRepo.create({
      id_company,
      ...vehicleData
    })

    return {
      success: true,
      message: t('server.vehicle.created'),
      data: {
        id_vehicle: vehicle.id_vehicle
      }
    }
  }

  async update(t, id_vehicle, id_company, updates) {
    // Verificar que vehículo existe
    const vehicle = await vehicleRepo.findById(id_vehicle, id_company)
    if (!vehicle) {
      throw new AppError(404, t('server.vehicle.notFound'))
    }

    // Si actualiza placa, verificar que no exista otra con la misma
    if (updates.license_plate && updates.license_plate !== vehicle.license_plate) {
      const existing = await vehicleRepo.findByLicensePlateExcluding(
        updates.license_plate,
        id_company,
        id_vehicle
      )
      if (existing) {
        throw new AppError(409, t('server.vehicle.alreadyExists'))
      }
    }

    const affectedRows = await vehicleRepo.update(id_vehicle, id_company, updates)
    if (affectedRows === 0) {
      throw new AppError(404, t('server.vehicle.notFound'))
    }

    return {
      success: true,
      message: t('server.vehicle.updated')
    }
  }

  async delete(t, id_vehicle, id_company) {
    // Verificar que vehículo existe
    const vehicle = await vehicleRepo.findById(id_vehicle, id_company)
    if (!vehicle) {
      throw new AppError(404, t('server.vehicle.notFound'))
    }

    // Verificar que no tenga movimientos asociados
    const totalMovements = await vehicleRepo.countMovements(id_vehicle)
    if (totalMovements > 0) {
      throw new AppError(400, t('server.vehicle.cannotDeleteWithMovements'))
    }

    const deletedRows = await vehicleRepo.delete(id_vehicle, id_company)
    if (deletedRows === 0) {
      throw new AppError(404, t('server.vehicle.notFound'))
    }

    return {
      success: true,
      message: t('server.vehicle.deleted')
    }
  }

  async getHistory(t, id_vehicle, id_company, limit = 50, offset = 0) {
    // Verificar que vehículo existe y pertenece a la empresa
    const vehicle = await vehicleRepo.findById(id_vehicle, id_company)
    if (!vehicle) {
      throw new AppError(404, t('server.vehicle.notFound'))
    }

    const history = await vehicleRepo.getVehicleHistory(id_vehicle, limit, offset)
    return {
      success: true,
      data: history
    }
  }
}

module.exports = new VehicleService()
