const shiftService = require('../services/shift.service')

class ShiftController {

  async openShift(req, res, next) {
    try {
      const result = await shiftService.openShift(req.t, req.user.id_company, req.user.id_user, req.body)
      res.status(201).json(result)
    } catch (err) { next(err) }
  }

  async closeShift(req, res, next) {
    try {
      const result = await shiftService.closeShift(req.t, req.user.id_company, req.user.id_user, req.body)
      res.json(result)
    } catch (err) { next(err) }
  }

  async getCurrent(req, res, next) {
    try {
      const result = await shiftService.getCurrent(req.t, req.user.id_company)
      res.json(result)
    } catch (err) { next(err) }
  }

  async getSummary(req, res, next) {
    try {
      const result = await shiftService.getSummary(req.user.id_company)
      res.json(result)
    } catch (err) { next(err) }
  }
}

module.exports = new ShiftController()