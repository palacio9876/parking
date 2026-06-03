const { User } = require('../models')
const { Op } = require('sequelize')

class UserRepository {

  findAllByCompany(id_company) {
    return User.findAll({
      where: { id_company, active: true },
      order: [['creation_date', 'DESC']],
      attributes: ['id_user', 'name', 'username', 'role', 'active', 'last_access']
    })
  }

  findById(id_user, id_company) {
    return User.findOne({
      where: { id_user, id_company }
    })
  }

  findByUsername(username, id_company) {
    return User.findOne({
      where: { username, id_company }
    })
  }

  findByUsernameExcluding(username, id_company, id_user) {
    return User.findOne({
      where: {
        username,
        id_company,
        id_user: { [Op.ne]: id_user }
      }
    })
  }

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

  async update(id_user, id_company, updates) {
    const [affectedRows] = await User.update(updates, {
      where: { id_user, id_company }
    })
    return affectedRows
  }

  async deactivate(id_user, id_company) {
    const [affectedRows] = await User.update(
      { active: false },
      { where: { id_user, id_company } }
    )
    return affectedRows
  }

  updateLastAccess(id_user) {
    return User.update(
      { last_access: new Date() },
      { where: { id_user } }
    )
  }
}

module.exports = new UserRepository()
