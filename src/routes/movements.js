// Rutas de movimientos: entrada, salida, detalle e historial
const { Router }  = require('express')
const movementController = require('../controllers/movement.controller')
const { auth }    = require('../middlewares/auth')
const { validate }= require('../middlewares/validate')
const { createMovementDto, recordExitDto } = require('../dtos/movement.dto')
const { sanitizeIdParam } = require('../utils/sanitize')

const router = Router()
router.use(auth)

router.post('/entry',     validate(createMovementDto), (req, res, next) => movementController.recordEntry(req, res, next))
router.post('/exit',      validate(recordExitDto),     (req, res, next) => movementController.recordExit(req, res, next))
router.get('/:id',        sanitizeIdParam('id'),        (req, res, next) => movementController.getDetail(req, res, next))
router.get('/:id/history',sanitizeIdParam('id'),        (req, res, next) => movementController.getHistory(req, res, next))

module.exports = router