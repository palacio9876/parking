const companyService = require('../services/company.service')

class CompanyController {

  async getCompany(req, res, next) {
    try {
      const result = await companyService.getCompany(req.user.id_company)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  async getSettings(req, res, next) {
    try {
      const result = await companyService.getSettings(req.user.id_company)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  async updateCompany(req, res, next) {
    try {
      const result = await companyService.updateCompany(req.user.id_company, req.body)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  async updateSettings(req, res, next) {
    try {
      const result = await companyService.updateSettings(req.user.id_company, req.body)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new CompanyController()
