const { Router } = require('express')
const rateController = require('../controllers/rate.controller')
const { auth, requireAdmin } = require('../middlewares/auth')
const { validate } = require('../middlewares/validate')
const { createRateDto } = require('../dtos/rate.dto')

const router = Router()

router.use(auth)

router.get('/current', (req, res, next) => rateController.getCurrent(req, res, next))

router.put(
  '/',
  requireAdmin,
  validate(createRateDto),
  (req, res, next) => rateController.createOrUpdate(req, res, next)
)

module.exports = router
