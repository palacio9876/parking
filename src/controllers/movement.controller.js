const movementService = require('../services/movement.service')

class MovementController {

  async recordEntry(req, res, next) {
    try {
      const result = await movementService.recordEntry(
        req.t,
        req.user.id_company,
        req.user.id_user,
        req.body
      )
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  }

  async recordExit(req, res, next) {
    try {
      const result = await movementService.recordExit(
        req.t,
        req.user.id_company,
        req.user.id_user,
        req.body
      )
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  async getDetail(req, res, next) {
    try {
      const { id } = req.params
      const result = await movementService.getDetail(req.t, id, req.user.id_company)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

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
