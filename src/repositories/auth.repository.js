const { Company, User, LoginAttempt } = require('../models')
const { Op } = require('sequelize')

class AuthRepository {

  findCompanyByTaxId(tax_id) {
    return Company.findOne({
      where: { tax_id, active: true },
      attributes: ['id_company', 'name', 'plan', 'tax_id']
    })
  }

  findUserByUsername(username, id_company) {
    return User.findOne({
      where: { username, id_company, active: true }
    })
  }

  updateLastAccess(id_user) {
    return User.update(
      { last_access: new Date() },
      { where: { id_user } }
    )
  }

  logAttempt({ id_company, username, successful, ip_address }) {
    return LoginAttempt.create({
      id_company,
      username,
      successful,
      ip_address,
      attempt_date: new Date()
    })
  }

  countRecentFailedAttempts(id_company, username, ip_address) {
    const since = new Date(Date.now() - 15 * 60 * 1000) // últimos 15 minutos
    return LoginAttempt.count({
      where: {
        id_company,
        successful: false,
        attempt_date: { [Op.gte]: since },
        [Op.or]: [{ username }, { ip_address }]
      }
    })
  }
}

module.exports = new AuthRepository()