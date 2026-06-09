// Rutas de vehículos: CRUD e historial de vehículos
const { Router } = require('express')
const vehicleController = require('../controllers/vehicle.controller')
const { auth } = require('../middlewares/auth')
const { validate } = require('../middlewares/validate')
const { createVehicleDto, updateVehicleDto } = require('../dtos/vehicle.dto')
const { sanitizeIdParam } = require('../utils/sanitize')

const router = Router()

// Todas las rutas requieren autenticación
router.use(auth)

// GET /api/vehicles - Obtener todos los vehículos de la empresa
router.get(
  '/',
  (req, res, next) => vehicleController.getAll(req, res, next)
)

// POST /api/vehicles - Crear nuevo vehículo
router.post(
  '/',
  validate(createVehicleDto),
  (req, res, next) => vehicleController.create(req, res, next)
)

// GET /api/vehicles/:id - Obtener un vehículo específico
router.get(
  '/:id',
  sanitizeIdParam('id'),
  (req, res, next) => vehicleController.getById(req, res, next)
)

// PUT /api/vehicles/:id - Actualizar vehículo
router.put(
  '/:id',
  sanitizeIdParam('id'),
  validate(updateVehicleDto),
  (req, res, next) => vehicleController.update(req, res, next)
)

// DELETE /api/vehicles/:id - Eliminar vehículo (solo sin movimientos)
router.delete(
  '/:id',
  sanitizeIdParam('id'),
  (req, res, next) => vehicleController.delete(req, res, next)
)

// GET /api/vehicles/:id/history - Obtener historial de movimientos
router.get(
  '/:id/history',
  sanitizeIdParam('id'),
  (req, res, next) => vehicleController.getHistory(req, res, next)
)

module.exports = router
