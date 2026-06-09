// Controlador de tarifas: consulta y actualización de tarifas por tipo de vehículo
const rateService = require('../services/rate.service')

class RateController {

  /**
   * GET /api/rates/current
   * Obtiene las tarifas activas de la empresa
   */
  async getCurrent(req, res, next) {
    try {
      const result = await rateService.getCurrent(req.user.id_company)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  /**
   * PUT /api/rates/
   * Crea o actualiza una tarifa (solo admin)
   */
  async createOrUpdate(req, res, next) {
    try {
      const result = await rateService.createOrUpdate(req.t, req.user.id_company, req.body)
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new RateController()
