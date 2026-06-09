// Servicio de autenticación: lógica de negocio para inicio de sesión
const bcrypt   = require('bcryptjs')
const jwt      = require('jsonwebtoken')
const authRepo = require('../repositories/auth.repository')
const { AppError } = require('../utils/AppError')

class AuthService {

  /**
   * Procesa el inicio de sesión de un usuario
   * @param {function} t - Función de traducción
   * @param {object} params - { tax_id, username, password, ip_address }
   * @returns {object} { success, message, data: { token, user } }
   * @throws {AppError} 401 si credenciales inválidas, 429 si demasiados intentos
   */
  async login(t, { tax_id, username, password, ip_address }) {

    // 1. Verificar empresa
    const company = await authRepo.findCompanyByTaxId(tax_id)
    if (!company) {
      throw new AppError(401, t('server.auth.companyNotFound'))
    }

    // 2. Verificar intentos fallidos (máx 5 en 15 min)
    const failedAttempts = await authRepo.countRecentFailedAttempts(
      company.id_company, username, ip_address
    )
    if (failedAttempts >= 5) {
      await authRepo.logAttempt({
        id_company: company.id_company,
        username,
        successful: false,
        ip_address
      })
      throw new AppError(429, t('server.auth.tooManyAttempts'))
    }

    // 3. Verificar usuario
    const user = await authRepo.findUserByUsername(username, company.id_company)
    if (!user) {
      await authRepo.logAttempt({
        id_company: company.id_company,
        username,
        successful: false,
        ip_address
      })
      throw new AppError(401, t('server.auth.invalidCredentials'))
    }

    // 4. Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      await authRepo.logAttempt({
        id_company: company.id_company,
        username,
        successful: false,
        ip_address
      })
      throw new AppError(401, t('server.auth.invalidCredentials'))
    }

    // 5. Actualizar último acceso y registrar intento exitoso
    await authRepo.updateLastAccess(user.id_user)
    await authRepo.logAttempt({
      id_company: company.id_company,
      username,
      successful: true,
      ip_address
    })

    // 6. Generar token JWT con expiración de 8 horas
    const token = jwt.sign(
      {
        id_user:    user.id_user,
        id_company: user.id_company,
        role:       user.role,
        name:       user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    return {
      success: true,
      message: t('server.auth.loginSuccess'),
      data: {
        token,
        user: {
          id_user:    user.id_user,
          name:       user.name,
          username:   user.username,
          role:       user.role,
          id_company: user.id_company,
          company:    company.name,
          plan:       company.plan,
        }
      }
    }
  }
}

module.exports = new AuthService()