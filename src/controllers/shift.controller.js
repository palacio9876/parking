// Controlador de turnos: apertura, cierre y consulta de turnos de caja
const shiftService = require('../services/shift.service')

class ShiftController {

  /**
   * POST /api/shifts/open
   * Abre un nuevo turno de caja
   */
  async openShift(req, res, next) {
    try {
      const result = await shiftService.openShift(req.t, req.user.id_company, req.user.id_user, req.body)
      res.status(201).json(result)
    } catch (err) { next(err) }
  }

  /**
   * POST /api/shifts/close
   * Cierra el turno actual registrando totales
   */
  async closeShift(req, res, next) {
    try {
      const result = await shiftService.closeShift(req.t, req.user.id_company, req.user.id_user, req.body)
      res.json(result)
    } catch (err) { next(err) }
  }

  /**
   * GET /api/shifts/current
   * Obtiene el turno abierto actual
   */
  async getCurrent(req, res, next) {
    try {
      const result = await shiftService.getCurrent(req.t, req.user.id_company)
      res.json(result)
    } catch (err) { next(err) }
  }

  /**
   * GET /api/shifts/summary
   * Obtiene un resumen del turno actual
   */
  async getSummary(req, res, next) {
    try {
      const result = await shiftService.getSummary(req.user.id_company)
      res.json(result)
    } catch (err) { next(err) }
  }
}

module.exports = new ShiftController()