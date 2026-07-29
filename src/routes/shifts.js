// Rutas de turnos: apertura, cierre y consulta de turnos de caja
const { Router }  = require('express')
const shiftController = require('../controllers/shift.controller')
const { auth }    = require('../middlewares/auth')
const { validate }= require('../middlewares/validate')
const { openShiftDto, closeShiftDto } = require('../dtos/shift.dto')

const router = Router()
router.use(auth)

router.get('/current', (req, res, next) => shiftController.getCurrent(req, res, next))
router.get('/summary', (req, res, next) => shiftController.getSummary(req, res, next))
router.post('/open',   validate(openShiftDto),  (req, res, next) => shiftController.openShift(req, res, next))
router.post('/close',  validate(closeShiftDto), (req, res, next) => shiftController.closeShift(req, res, next))

module.exports = router