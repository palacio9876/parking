const { Router } = require('express')
const userController = require('../controllers/user.controller')
const { auth, requireAdmin } = require('../middlewares/auth')
const { validate } = require('../middlewares/validate')
const { createUserDto, updateUserDto } = require('../dtos/user.dto')
const { sanitizeIdParam } = require('../utils/sanitize')

const router = Router()

// Todas las rutas requieren autenticación y rol admin
router.use(auth, requireAdmin)

// Listar usuarios de la empresa
router.get(
  '/',
  (req, res, next) => userController.getAll(req, res, next)
)

// Crear nuevo usuario
router.post(
  '/',
  validate(createUserDto),
  (req, res, next) => userController.create(req, res, next)
)

// Obtener un usuario específico
router.get(
  '/:id',
  sanitizeIdParam('id'),
  (req, res, next) => userController.getById(req, res, next)
)

// Actualizar usuario
router.put(
  '/:id',
  sanitizeIdParam('id'),
  validate(updateUserDto),
  (req, res, next) => userController.update(req, res, next)
)

// Desactivar usuario
router.delete(
  '/:id',
  sanitizeIdParam('id'),
  (req, res, next) => userController.deactivate(req, res, next)
)

module.exports = router


