const companyRepo = require('../repositories/company.repository')
const { AppError } = require('../utils/AppError')

class CompanyService {

  async getCompany(t, id_company) {
    const company = await companyRepo.findById(id_company)
    if (!company) {
      throw new AppError(404, t('server.company.notFound'))
    }
    return {
      success: true,
      data: company
    }
  }

  async getSettings(t, id_company) {
    const settings = await companyRepo.findSettings(id_company)
    if (!settings) {
      throw new AppError(404, t('server.company.settingsNotFound'))
    }
    return {
      success: true,
      data: settings
    }
  }

  async updateCompany(t, id_company, updates) {
    const company = await companyRepo.findById(id_company)
    if (!company) {
      throw new AppError(404, t('server.company.notFound'))
    }
    await companyRepo.updateCompany(id_company, updates)
    return {
      success: true,
      message: t('server.company.updated')
    }
  }

  async updateSettings(t, id_company, updates) {
    const settings = await companyRepo.findSettings(id_company)
    if (!settings) {
      const newSettings = await companyRepo.createSettings(id_company, updates)
      return {
        success: true,
        message: t('server.company.settingsCreated'),
        data: newSettings
      }
    }

    const affectedRows = await companyRepo.updateSettings(id_company, updates)
    if (affectedRows === 0 && !settings) {
      throw new AppError(404, t('server.company.settingsNotFound'))
    }
    return {
      success: true,
      message: t('server.company.settingsUpdated')
    }
  }

  async getLogo(id_company) {
    const company = await companyRepo.findById(id_company)
    return {
      success: true,
      data: { logo_url: company?.logo_url }
    }
  }

  async uploadLogo(t, id_company, buffer) {
    if (!buffer) {
      throw new AppError(400, t('server.company.noLogoFile'))
    }
    const affectedRows = await companyRepo.updateCompany(id_company, { logo_url: buffer })
    if (affectedRows === 0) {
      throw new AppError(404, t('server.company.notFound'))
    }
    return {
      success: true,
      message: t('server.company.logoUploaded')
    }
  }
}

module.exports = new CompanyService()
