// Controlador de vehículos: CRUD e historial de vehículos
const vehicleService = require('../services/vehicle.service')

class VehicleController {

  /**
   * GET /api/vehicles
   * Lista todos los vehículos de la empresa
   */
  async getAll(req, res, next) {
    try {
      const result = await vehicleService.getAll(req.user.id_company)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/vehicles/:id
   * Obtiene un vehículo por ID
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params
      const result = await vehicleService.getById(req.t, id, req.user.id_company)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  /**
   * POST /api/vehicles
   * Crea un nuevo vehículo
   */
  async create(req, res, next) {
    try {
      const result = await vehicleService.create(req.t, req.user.id_company, req.body)
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  }

  /**
   * PUT /api/vehicles/:id
   * Actualiza un vehículo existente
   */
  async update(req, res, next) {
    try {
      const { id } = req.params
      const result = await vehicleService.update(req.t, id, req.user.id_company, req.body)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  /**
   * DELETE /api/vehicles/:id
   * Elimina un vehículo (solo si no tiene movimientos)
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params
      const result = await vehicleService.delete(req.t, id, req.user.id_company)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/vehicles/:id/history
   * Obtiene el historial de movimientos de un vehículo
   */
  async getHistory(req, res, next) {
    try {
      const { id } = req.params
      const { limit = 50, offset = 0 } = req.query
      const result = await vehicleService.getHistory(
        req.t,
        id,
        req.user.id_company,
        parseInt(limit),
        parseInt(offset)
      )
      res.json(result)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new VehicleController()
