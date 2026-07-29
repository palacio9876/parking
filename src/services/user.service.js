// Servicio de usuarios: lógica de negocio para CRUD de usuarios del sistema
const bcrypt = require('bcryptjs')
const userRepo = require('../repositories/user.repository')
const { AppError } = require('../utils/AppError')

class UserService {

  /**
   * Obtiene todos los usuarios activos de una empresa
   * @param {number} id_company - ID de la empresa
   * @returns {object} { success, data }
   */
  async getAll(id_company) {
    const users = await userRepo.findAllByCompany(id_company)
    return {
      success: true,
      data: users
    }
  }

  /**
   * Obtiene un usuario por ID
   * @param {function} t - Función de traducción
   * @param {number} id_user - ID del usuario
   * @param {number} id_company - ID de la empresa
   * @returns {object} { success, data }
   */
  async getById(id_user, id_company) {
    const user = await userRepo.findById(id_user, id_company)
    if (!user) {
      throw new AppError(404, 'Usuario no encontrado')
    }
    return {
      success: true,
      data: {
        id_user: user.id_user,
        name: user.name,
        username: user.username,
        role: user.role,
        active: user.active,
        last_access: user.last_access
      }
    }
  }

  /**
   * Crea un nuevo usuario con contraseña hasheada
   * @param {function} t - Función de traducción
   * @param {number} id_company - ID de la empresa
   * @param {object} userData - { name, username, password, role, active }
   * @returns {object} { success, message, data: { id_user } }
   */
  async create(id_company, userData) {
    const existing = await userRepo.findByUsername(userData.username, id_company)
    if (existing) {
      throw new AppError(409, 'El usuario ya existe para esta empresa')
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10)

    const user = await userRepo.create({
      id_company,
      name: userData.name,
      username: userData.username,
      password: hashedPassword,
      role: userData.role,
      active: userData.active !== false
    })

    return {
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        id_user: user.id_user
      }
    }
  }

  /**
   * Actualiza un usuario existente (incluye cambio de contraseña con hash)
   * @param {number} id_user - ID del usuario
   * @param {number} id_company - ID de la empresa
   * @param {object} updates - Campos a actualizar
   * @returns {object} { success, message }
   */
  async update(id_user, id_company, updates) {
    const user = await userRepo.findById(id_user, id_company)
    if (!user) {
      throw new AppError(404, 'Usuario no encontrado')
    }

    if (updates.username && updates.username !== user.username) {
      const existing = await userRepo.findByUsernameExcluding(
        updates.username,
        id_company,
        id_user
      )
      if (existing) {
        throw new AppError(409, 'El usuario ya existe para esta empresa')
      }
    }

    const updateData = { ...updates }
    if (updates.password) {
      updateData.password = await bcrypt.hash(updates.password, 10)
    }

    const affectedRows = await userRepo.update(id_user, id_company, updateData)
    if (affectedRows === 0) {
      throw new AppError(404, 'Usuario no encontrado')
    }

    return {
      success: true,
      message: 'Usuario actualizado exitosamente'
    }
  }

  /**
   * Desactiva un usuario (borrado lógico). No permite desactivarse a sí mismo.
   * @param {function} t - Función de traducción
   * @param {number} id_user - ID del usuario a desactivar
   * @param {number} id_company - ID de la empresa
   * @param {number} currentUserId - ID del usuario que realiza la acción
   * @returns {object} { success, message }
   */
  async deactivate(id_user, id_company, currentUserId) {
    const user = await userRepo.findById(id_user, id_company)
    if (!user) {
      throw new AppError(404, 'Usuario no encontrado')
    }

    if (Number(id_user) === Number(currentUserId)) {
      throw new AppError(400, 'No puedes desactivar tu propio usuario')
    }

    const affectedRows = await userRepo.deactivate(id_user, id_company)
    if (affectedRows === 0) {
      throw new AppError(404, 'Usuario no encontrado')
    }

    return {
      success: true,
      message: 'Usuario desactivado exitosamente'
    }
  }
}

module.exports = new UserService()
