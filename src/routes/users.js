// Rutas de usuarios: CRUD de usuarios (solo admin)
const { Router } = require('express')
const userController = require('../controllers/user.controller')
const { auth, requireAdmin } = require('../middlewares/auth')
const { validate } = require('../middlewares/validate')
const { createUserDto, updateUserDto } = require('../dtos/user.dto')
const { sanitizeIdParam } = require('../utils/sanitize')

const router = Router()

// Todas las rutas requieren autenticación y rol admin
router.use(auth, requireAdmin)

// GET /api/users - Listar usuarios de la empresa
router.get(
  '/',
  (req, res, next) => userController.getAll(req, res, next)
)

// POST /api/users - Crear nuevo usuario
router.post(
  '/',
  validate(createUserDto),
  (req, res, next) => userController.create(req, res, next)
)

// GET /api/users/:id - Obtener un usuario específico
router.get(
  '/:id',
  sanitizeIdParam('id'),
  (req, res, next) => userController.getById(req, res, next)
)

// PUT /api/users/:id - Actualizar usuario
router.put(
  '/:id',
  sanitizeIdParam('id'),
  validate(updateUserDto),
  (req, res, next) => userController.update(req, res, next)
)

// DELETE /api/users/:id - Desactivar usuario (borrado lógico)
router.delete(
  '/:id',
  sanitizeIdParam('id'),
  (req, res, next) => userController.deactivate(req, res, next)
)

module.exports = router


