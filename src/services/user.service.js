const bcrypt = require('bcryptjs')
const userRepo = require('../repositories/user.repository')
const { AppError } = require('../utils/AppError')

class UserService {

  async getAll(id_company) {
    const users = await userRepo.findAllByCompany(id_company)
    return {
      success: true,
      data: users
    }
  }

  async getById(id_user, id_company) {
    const user = await userRepo.findById(id_user, id_company)
    if (!user) {
      throw new AppError(404, 'User not found')
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

  async create(id_company, userData) {
    // Verificar si usuario ya existe
    const existing = await userRepo.findByUsername(userData.username, id_company)
    if (existing) {
      throw new AppError(409, 'User already exists for this company')
    }

    // Hash password
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
      message: 'User created successfully',
      data: {
        id_user: user.id_user
      }
    }
  }

  async update(id_user, id_company, updates) {
    // Verificar que usuario existe
    const user = await userRepo.findById(id_user, id_company)
    if (!user) {
      throw new AppError(404, 'User not found')
    }

    // Si actualiza username, verificar que no exista otro con el mismo
    if (updates.username && updates.username !== user.username) {
      const existing = await userRepo.findByUsernameExcluding(
        updates.username,
        id_company,
        id_user
      )
      if (existing) {
        throw new AppError(409, 'User already exists for this company')
      }
    }

    // Hash password si se proporciona
    const updateData = { ...updates }
    if (updates.password) {
      updateData.password = await bcrypt.hash(updates.password, 10)
    }

    const affectedRows = await userRepo.update(id_user, id_company, updateData)
    if (affectedRows === 0) {
      throw new AppError(404, 'User not found')
    }

    return {
      success: true,
      message: 'User updated successfully'
    }
  }

  async deactivate(id_user, id_company, currentUserId) {
    // Verificar que usuario existe
    const user = await userRepo.findById(id_user, id_company)
    if (!user) {
      throw new AppError(404, 'User not found')
    }

    // No permitir desactivar tu propio usuario
    if (Number(id_user) === Number(currentUserId)) {
      throw new AppError(400, 'Cannot deactivate your own user')
    }

    const affectedRows = await userRepo.deactivate(id_user, id_company)
    if (affectedRows === 0) {
      throw new AppError(404, 'User not found')
    }

    return {
      success: true,
      message: 'User deactivated successfully'
    }
  }
}

module.exports = new UserService()
