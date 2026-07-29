// Repositorio de usuarios: operaciones CRUD sobre los usuarios del sistema
const { User } = require('../models')
const { Op } = require('sequelize')

class UserRepository {

  /**
   * Obtiene todos los usuarios activos de una empresa
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<Array>}
   */
  findAllByCompany(id_company) {
    return User.findAll({
      where: { id_company, active: true },
      order: [['creation_date', 'DESC']],
      attributes: ['id_user', 'name', 'username', 'role', 'active', 'last_access']
    })
  }

  /**
   * Busca un usuario por ID dentro de una empresa
   * @param {number} id_user - ID del usuario
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<object|null>}
   */
  findById(id_user, id_company) {
    return User.findOne({
      where: { id_user, id_company }
    })
  }

  /**
   * Busca un usuario por nombre de usuario
   * @param {string} username - Nombre de usuario
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<object|null>}
   */
  findByUsername(username, id_company) {
    return User.findOne({
      where: { username, id_company }
    })
  }

  /**
   * Busca un usuario por username excluyendo un ID específico (para validar unicidad al actualizar)
   * @param {string} username - Nombre de usuario
   * @param {number} id_company - ID de la empresa
   * @param {number} id_user - ID a excluir
   * @returns {Promise<object|null>}
   */
  findByUsernameExcluding(username, id_company, id_user) {
    return User.findOne({
      where: {
        username,
        id_company,
        id_user: { [Op.ne]: id_user }
      }
    })
  }

  /**
   * Crea un nuevo usuario
   * @param {object} params - { id_company, name, username, password, role, active }
   * @returns {Promise<object>}
   */
  async create({ id_company, name, username, password, role, active }) {
    const user = await User.create({
      id_company,
      name,
      username,
      password,
      role,
      active: active !== false,
      creation_date: new Date()
    })
    return user
  }

  /**
   * Actualiza un usuario
   * @param {number} id_user - ID del usuario
   * @param {number} id_company - ID de la empresa
   * @param {object} updates - Campos a actualizar
   * @returns {Promise<number>} Filas afectadas
   */
  async update(id_user, id_company, updates) {
    const [affectedRows] = await User.update(updates, {
      where: { id_user, id_company }
    })
    return affectedRows
  }

  /**
   * Desactiva un usuario (borrado lógico)
   * @param {number} id_user - ID del usuario
   * @param {number} id_company - ID de la empresa
   * @returns {Promise<number>} Filas afectadas
   */
  async deactivate(id_user, id_company) {
    const [affectedRows] = await User.update(
      { active: false },
      { where: { id_user, id_company } }
    )
    return affectedRows
  }

  /**
   * Actualiza la fecha de último acceso del usuario
   * @param {number} id_user - ID del usuario
   * @returns {Promise}
   */
  updateLastAccess(id_user) {
    return User.update(
      { last_access: new Date() },
      { where: { id_user } }
    )
  }
}

module.exports = new UserRepository()
