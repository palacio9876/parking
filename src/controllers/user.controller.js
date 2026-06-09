// Controlador de usuarios: CRUD de usuarios del sistema
const userService = require('../services/user.service')

class UserController {

  /**
   * GET /api/users
   * Lista todos los usuarios activos de la empresa
   */
  async getAll(req, res, next) {
    try {
      const result = await userService.getAll(req.user.id_company)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/users/:id
   * Obtiene un usuario por ID
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params
      const result = await userService.getById(req.t, id, req.user.id_company)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  /**
   * POST /api/users
   * Crea un nuevo usuario
   */
  async create(req, res, next) {
    try {
      const result = await userService.create(req.t, req.user.id_company, req.body)
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  }

  /**
   * PUT /api/users/:id
   * Actualiza un usuario existente
   */
  async update(req, res, next) {
    try {
      const { id } = req.params
      const result = await userService.update(req.t, id, req.user.id_company, req.body)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  /**
   * DELETE /api/users/:id
   * Desactiva un usuario (borrado lógico)
   */
  async deactivate(req, res, next) {
    try {
      const { id } = req.params
      const result = await userService.deactivate(req.t, id, req.user.id_company, req.user.id_user)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new UserController()
