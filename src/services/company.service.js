// Servicio de empresa: lógica de negocio para gestionar empresas y sus configuraciones
const companyRepo = require('../repositories/company.repository')
const { AppError } = require('../utils/AppError')

class CompanyService {

  /**
   * Obtiene los datos de una empresa
   * @param {function} t - Función de traducción
   * @param {number} id_company - ID de la empresa
   * @returns {object} { success, data }
   */
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

  /**
   * Obtiene la configuración de una empresa
   * @param {function} t - Función de traducción
   * @param {number} id_company - ID de la empresa
   * @returns {object} { success, data }
   */
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

  /**
   * Actualiza los datos de la empresa
   * @param {function} t - Función de traducción
   * @param {number} id_company - ID de la empresa
   * @param {object} updates - Campos a actualizar
   * @returns {object} { success, message }
   */
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

  /**
   * Actualiza o crea la configuración de la empresa
   * @param {function} t - Función de traducción
   * @param {number} id_company - ID de la empresa
   * @param {object} updates - Campos de configuración
   * @returns {object} { success, message, data? }
   */
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

  /**
   * Obtiene el logo de la empresa en formato binario
   * @param {number} id_company - ID de la empresa
   * @returns {object} { success, data: { logo_url } }
   */
  async getLogo(id_company) {
    const company = await companyRepo.findById(id_company)
    return {
      success: true,
      data: { logo_url: company?.logo_url }
    }
  }

  /**
   * Sube/actualiza el logo de la empresa
   * @param {function} t - Función de traducción
   * @param {number} id_company - ID de la empresa
   * @param {Buffer} buffer - Datos binarios del logo
   * @returns {object} { success, message }
   */
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
