const userService = require('../services/user.service')

class UserController {

  async getAll(req, res, next) {
    try {
      const result = await userService.getAll(req.user.id_company)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params
      const result = await userService.getById(req.t, id, req.user.id_company)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

  async create(req, res, next) {
    try {
      const result = await userService.create(req.t, req.user.id_company, req.body)
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params
      const result = await userService.update(req.t, id, req.user.id_company, req.body)
      res.json(result)
    } catch (err) {
      next(err)
    }
  }

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
