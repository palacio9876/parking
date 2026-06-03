const { Company, CompanySetting } = require('../models')

class CompanyRepository {

  findById(id_company) {
    return Company.findByPk(id_company)
  }

  findSettings(id_company) {
    return CompanySetting.findOne({
      where: { id_company }
    })
  }

  async updateCompany(id_company, updates) {
    const [affectedRows] = await Company.update(updates, {
      where: { id_company }
    })
    return affectedRows
  }

  async updateSettings(id_company, updates) {
    const [affectedRows] = await CompanySetting.update(updates, {
      where: { id_company }
    })
    return affectedRows
  }

  async createSettings(id_company, data) {
    return CompanySetting.create({
      id_company,
      ...data
    })
  }
}

module.exports = new CompanyRepository()
