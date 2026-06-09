// Repositorio de autenticación: operaciones de consulta sobre empresas, usuarios e intentos de login
const { Company, User, LoginAttempt } = require('../models')
const { Op } = require('sequelize')

class AuthRepository {

  /**
   * Busca una empresa activa por su NIT
   * @param {string} tax_id - NIT de la empresa
   * @returns {Promise<object|null>} Datos básicos de la empresa o null
   */
  findCompanyByTaxId(tax_id) {
    return Company.findOne({
      where: { tax_id, active: true },
      attributes: ['id_company', 'name', 'plan', 'tax_id']
    })
  }

  /**
   * Busca un usuario activo por nombre de usuario y empresa
   * @param {string} username - Nombre de usuario
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<object|null>} Usuario encontrado o null
   */
  findUserByUsername(username, id_company) {
    return User.findOne({
      where: { username, id_company, active: true }
    })
  }

  /**
   * Actualiza la fecha del último acceso del usuario
   * @param {number} id_user - ID del usuario
   * @returns {Promise} Resultado de la actualización
   */
  updateLastAccess(id_user) {
    return User.update(
      { last_access: new Date() },
      { where: { id_user } }
    )
  }

  /**
   * Registra un intento de inicio de sesión
   * @param {object} params - { id_company, username, successful, ip_address }
   * @returns {Promise} Registro creado
   */
  logAttempt({ id_company, username, successful, ip_address }) {
    return LoginAttempt.create({
      id_company,
      username,
      successful,
      ip_address,
      attempt_date: new Date()
    })
  }

  /**
   * Cuenta los intentos fallidos en los últimos 15 minutos
   * @param {number} id_company - ID de la empresa
   * @param {string} username - Nombre de usuario
   * @param {string} ip_address - Dirección IP
   * @returns {Promise<number>} Cantidad de intentos fallidos recientes
   */
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