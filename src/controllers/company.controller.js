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

  async getLogo(req, res, next) {
    try {
      const result = await companyService.getLogo(req.user.id_company)
      if (result.data?.logo_url) {
        res.set('Content-Type', 'image/png')
        res.send(result.data.logo_url)
      } else {
        res.status(404).json({ success: false, error: 'Logo not found' })
      }
    } catch (err) {
      next(err)
    }
  }

  async uploadLogo(req, res, next) {
    try {
      const result = await companyService.uploadLogo(req.user.id_company, req.file?.buffer)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new CompanyController()
