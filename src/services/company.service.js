const companyRepo = require('../repositories/company.repository')
const { AppError } = require('../utils/AppError')

class CompanyService {

  async getCompany(id_company) {
    const company = await companyRepo.findById(id_company)
    if (!company) {
      throw new AppError(404, 'Company not found')
    }
    return {
      success: true,
      data: company
    }
  }

  async getSettings(id_company) {
    const settings = await companyRepo.findSettings(id_company)
    if (!settings) {
      throw new AppError(404, 'Settings not found')
    }
    return {
      success: true,
      data: settings
    }
  }

  async updateCompany(id_company, updates) {
    const affectedRows = await companyRepo.updateCompany(id_company, updates)
    if (affectedRows === 0) {
      throw new AppError(404, 'Company not found')
    }
    return {
      success: true,
      message: 'Company updated successfully'
    }
  }

  async updateSettings(id_company, updates) {
    const settings = await companyRepo.findSettings(id_company)
    if (!settings) {
      const newSettings = await companyRepo.createSettings(id_company, updates)
      return {
        success: true,
        message: 'Settings created successfully',
        data: newSettings
      }
    }

    const affectedRows = await companyRepo.updateSettings(id_company, updates)
    if (affectedRows === 0) {
      throw new AppError(404, 'Settings not found')
    }
    return {
      success: true,
      message: 'Settings updated successfully'
    }
  }
}

module.exports = new CompanyService()
