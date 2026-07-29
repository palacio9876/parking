// Rutas de pagos: registro de pagos en lote
const { Router } = require('express')
const paymentController = require('../controllers/payment.controller')
const { auth } = require('../middlewares/auth')
const { validate } = require('../middlewares/validate')
const { createPaymentDto } = require('../dtos/payment.dto')

const router = Router()

router.use(auth)

router.post('/bulk', validate(createPaymentDto), (req, res, next) => paymentController.recordPayments(req, res, next))

module.exports = router
