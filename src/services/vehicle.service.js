// Servicio de vehículos: lógica de negocio para CRUD de vehículos
const vehicleRepo = require('../repositories/vehicle.repository')
const { AppError } = require('../utils/AppError')

class VehicleService {

  /**
   * Obtiene todos los vehículos de una empresa (con estado activo/inactivo)
   * @param {number} id_company - ID de la empresa
   * @returns {object} { success, data }
   */
  async getAll(id_company) {
    const vehicles = await vehicleRepo.findAllByCompany(id_company)
    return {
      success: true,
      data: vehicles
    }
  }

  /**
   * Obtiene un vehículo por ID
   * @param {function} t - Función de traducción
   * @param {number} id_vehicle - ID del vehículo
   * @param {number} id_company - ID de la empresa
   * @returns {object} { success, data }
   */
  async getById(id_vehicle, id_company) {
    const vehicle = await vehicleRepo.findById(id_vehicle, id_company)
    if (!vehicle) {
      throw new AppError(404, 'Vehículo no encontrado')
    }
    return {
      success: true,
      data: vehicle
    }
  }

  /**
   * Crea un nuevo vehículo (valida que la placa no exista)
   * @param {function} t - Función de traducción
   * @param {number} id_company - ID de la empresa
   * @param {object} vehicleData - { license_plate, type, color, model }
   * @returns {object} { success, message, data: { id_vehicle } }
   */
  async create(id_company, vehicleData) {
    const existing = await vehicleRepo.findByLicensePlate(vehicleData.license_plate, id_company)
    if (existing) {
      throw new AppError(409, 'Ya existe un vehículo con esta placa')
    }

    const vehicle = await vehicleRepo.create({
      id_company,
      ...vehicleData
    })

    return {
      success: true,
      message: 'Vehículo creado exitosamente',
      data: {
        id_vehicle: vehicle.id_vehicle
      }
    }
  }

  /**
   * Actualiza un vehículo validando unicidad de placa
   * @param {function} t - Función de traducción
   * @param {number} id_vehicle - ID del vehículo
   * @param {number} id_company - ID de la empresa
   * @param {object} updates - Campos a actualizar
   * @returns {object} { success, message }
   */
  async update(id_vehicle, id_company, updates) {
    const vehicle = await vehicleRepo.findById(id_vehicle, id_company)
    if (!vehicle) {
      throw new AppError(404, 'Vehículo no encontrado')
    }

    if (updates.license_plate && updates.license_plate !== vehicle.license_plate) {
      const existing = await vehicleRepo.findByLicensePlateExcluding(
        updates.license_plate,
        id_company,
        id_vehicle
      )
      if (existing) {
        throw new AppError(409, 'Ya existe un vehículo con esta placa')
      }
    }

    const affectedRows = await vehicleRepo.update(id_vehicle, id_company, updates)
    if (affectedRows === 0) {
      throw new AppError(404, 'Vehículo no encontrado')
    }

    return {
      success: true,
      message: 'Vehículo actualizado exitosamente'
    }
  }

  /**
   * Elimina un vehículo (solo si no tiene movimientos asociados)
   * @param {function} t - Función de traducción
   * @param {number} id_vehicle - ID del vehículo
   * @param {number} id_company - ID de la empresa
   * @returns {object} { success, message }
   */
  async delete(id_vehicle, id_company) {
    const vehicle = await vehicleRepo.findById(id_vehicle, id_company)
    if (!vehicle) {
      throw new AppError(404, 'Vehículo no encontrado')
    }

    const totalMovements = await vehicleRepo.countMovements(id_vehicle)
    if (totalMovements > 0) {
      throw new AppError(400, 'No se puede eliminar un vehículo con historial de movimientos')
    }

    const deletedRows = await vehicleRepo.delete(id_vehicle, id_company)
    if (deletedRows === 0) {
      throw new AppError(404, 'Vehículo no encontrado')
    }

    return {
      success: true,
      message: 'Vehículo eliminado exitosamente'
    }
  }

  /**
   * Obtiene el historial de movimientos de un vehículo
   * @param {function} t - Función de traducción
   * @param {number} id_vehicle - ID del vehículo
   * @param {number} id_company - ID de la empresa
   * @param {number} limit - Límite de resultados
   * @param {number} offset - Desplazamiento
   * @returns {object} { success, data }
   */
  async getHistory(id_vehicle, id_company, limit = 50, offset = 0) {
    const vehicle = await vehicleRepo.findById(id_vehicle, id_company)
    if (!vehicle) {
      throw new AppError(404, 'Vehículo no encontrado')
    }

    const history = await vehicleRepo.getVehicleHistory(id_vehicle, limit, offset)
    return {
      success: true,
      data: history
    }
  }
}

module.exports = new VehicleService()
