// Controlador de empresa: maneja solicitudes de datos, configuración y logo
const companyService = require('../services/company.service')

class CompanyController {

  /**
   * GET /api/companies/me
   * Obtiene datos de la empresa del usuario autenticado
   */
  async getCompany(req, res, next) {
    try {
      const result = await companyService.getCompany(req.user.id_company)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/companies/config
   * Obtiene la configuración de la empresa (capacidades, horarios, etc.)
   */
  async getSettings(req, res, next) {
    try {
      const result = await companyService.getSettings(req.user.id_company)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  /**
   * PUT /api/companies/
   * Actualiza los datos generales de la empresa (solo admin)
   */
  async updateCompany(req, res, next) {
    try {
      const result = await companyService.updateCompany(req.user.id_company, req.body)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  /**
   * PUT /api/companies/config
   * Actualiza la configuración de la empresa (solo admin)
   */
  async updateSettings(req, res, next) {
    try {
      const result = await companyService.updateSettings(req.user.id_company, req.body)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/companies/logo
   * Obtiene el logo de la empresa como imagen
   */
  async getLogo(req, res, next) {
    try {
      const result = await companyService.getLogo(req.user.id_company)
      if (result.data?.logo_url) {
        res.set('Content-Type', 'image/png')
        res.send(result.data.logo_url)
      } else {
        res.status(404).json({ success: false, error: 'Logo no encontrado' })
      }
    } catch (err) {
      next(err)
    }
  }

  /**
   * POST /api/companies/logo
   * Sube/actualiza el logo de la empresa (solo admin)
   */
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
