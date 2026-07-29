// Controlador de movimientos: entrada, salida, detalle e historial
const movementService = require('../services/movement.service')

class MovementController {

  /**
   * POST /api/movements/entry
   * Registra la entrada de un vehículo
   */
  async recordEntry(req, res, next) {
    try {
      const result = await movementService.recordEntry(
        req.user.id_company,
        req.user.id_user,
        req.body
      )
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  }

  /**
   * POST /api/movements/calculate-exit
   * Calcula el total a pagar sin registrar la salida
   */
  async calculateExit(req, res, next) {
    try {
      const result = await movementService.calculateExit(
        req.user.id_company,
        req.body
      )
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  /**
   * POST /api/movements/exit
   * Registra la salida de un vehículo y calcula el total
   */
  async recordExit(req, res, next) {
    try {
      const result = await movementService.recordExit(
        req.user.id_company,
        req.user.id_user,
        req.body
      )
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/movements/:id
   * Obtiene el detalle de un movimiento
   */
  async getDetail(req, res, next) {
    try {
      const { id } = req.params
      const result = await movementService.getDetail(id, req.user.id_company)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/movements/:id/history
   * Obtiene el historial de movimientos de un vehículo
   */
  async getHistory(req, res, next) {
    try {
      const { id } = req.params
      const { limit = 50, offset = 0 } = req.query
      const result = await movementService.getHistory(
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

module.exports = new MovementController()
