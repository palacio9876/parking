// Repositorio de empresa: operaciones sobre compañías y sus configuraciones
const { Company, CompanySetting } = require('../models')

class CompanyRepository {

  /**
   * Busca una empresa por su ID
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<object|null>}
   */
  findById(id_company) {
    return Company.findByPk(id_company)
  }

  /**
   * Obtiene la configuración de una empresa
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<object|null>}
   */
  findSettings(id_company) {
    return CompanySetting.findOne({
      where: { id_company }
    })
  }

  /**
   * Actualiza los datos de una empresa
   * @param {number} id_company - ID de la empresa
   * @param {object} updates - Campos a actualizar
   * @returns {Promise<number>} Número de filas afectadas
   */
  async updateCompany(id_company, updates) {
    const [affectedRows] = await Company.update(updates, {
      where: { id_company }
    })
    return affectedRows
  }

  /**
   * Actualiza la configuración de una empresa
   * @param {number} id_company - ID de la empresa
   * @param {object} updates - Campos a actualizar
   * @returns {Promise<number>} Número de filas afectadas
   */
  async updateSettings(id_company, updates) {
    const [affectedRows] = await CompanySetting.update(updates, {
      where: { id_company }
    })
    return affectedRows
  }

  /**
   * Crea la configuración inicial de una empresa
   * @param {number} id_company - ID de la empresa
   * @param {object} data - Datos de configuración
   * @returns {Promise<object>} Configuración creada
   */
  async createSettings(id_company, data) {
    return CompanySetting.create({
      id_company,
      ...data
    })
  }
}

module.exports = new CompanyRepository()
