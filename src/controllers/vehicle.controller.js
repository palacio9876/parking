const vehicleService = require('../services/vehicle.service')

class VehicleController {

  async getAll(req, res, next) {
    try {
      const result = await vehicleService.getAll(req.user.id_company)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params
      const result = await vehicleService.getById(id, req.user.id_company)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  async create(req, res, next) {
    try {
      const result = await vehicleService.create(req.user.id_company, req.body)
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params
      const result = await vehicleService.update(id, req.user.id_company, req.body)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params
      const result = await vehicleService.delete(id, req.user.id_company)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  async getHistory(req, res, next) {
    try {
      const { id } = req.params
      const { limit = 50, offset = 0 } = req.query
      const result = await vehicleService.getHistory(
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
