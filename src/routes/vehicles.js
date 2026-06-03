const { Router } = require('express')
const vehicleController = require('../controllers/vehicle.controller')
const { auth } = require('../middlewares/auth')
const { validate } = require('../middlewares/validate')
const { createVehicleDto, updateVehicleDto } = require('../dtos/vehicle.dto')
const { sanitizeIdParam } = require('../utils/sanitize')

const router = Router()

// Todas las rutas requieren autenticación
router.use(auth)

// Obtener todos los vehículos de la empresa
router.get(
  '/',
  (req, res, next) => vehicleController.getAll(req, res, next)
)

// Crear nuevo vehículo
router.post(
  '/',
  validate(createVehicleDto),
  (req, res, next) => vehicleController.create(req, res, next)
)

// Obtener un vehículo específico
router.get(
  '/:id',
  sanitizeIdParam('id'),
  (req, res, next) => vehicleController.getById(req, res, next)
)

// Actualizar vehículo
router.put(
  '/:id',
  sanitizeIdParam('id'),
  validate(updateVehicleDto),
  (req, res, next) => vehicleController.update(req, res, next)
)

// Eliminar vehículo
router.delete(
  '/:id',
  sanitizeIdParam('id'),
  (req, res, next) => vehicleController.delete(req, res, next)
)

// Obtener historial de movimientos de un vehículo
router.get(
  '/:id/history',
  sanitizeIdParam('id'),
  (req, res, next) => vehicleController.getHistory(req, res, next)
)

module.exports = router
