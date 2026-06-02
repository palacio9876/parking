const rateService = require('../services/rate.service')

class RateController {

  async getCurrent(req, res, next) {
    try {
      const result = await rateService.getCurrent(req.user.id_company)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  async createOrUpdate(req, res, next) {
    try {
      const result = await rateService.createOrUpdate(req.user.id_company, req.body)
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new RateController()
