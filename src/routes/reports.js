// Rutas de reportes: KPIs, ingresos, movimientos, turnos y exportación
const { Router } = require('express')
const reportController = require('../controllers/report.controller')
const { auth }   = require('../middlewares/auth')

const router = Router()
router.use(auth)

router.get('/kpis',                    (req, res, next) => reportController.getKPIs(req, res, next))
router.get('/income-by-day',           (req, res, next) => reportController.getIncomeByDay(req, res, next))
router.get('/income-by-payment-method',(req, res, next) => reportController.getIncomeByMethod(req, res, next))
router.get('/movements',               (req, res, next) => reportController.getMovements(req, res, next))
router.get('/top-plates',              (req, res, next) => reportController.getTopPlates(req, res, next))
router.get('/shifts',                  (req, res, next) => reportController.getShifts(req, res, next))
router.get('/shifts/export/xlsx',      (req, res, next) => reportController.exportShiftsXlsx(req, res, next))
router.get('/export/xlsx',             (req, res, next) => reportController.exportMovementsXlsx(req, res, next))

module.exports = router