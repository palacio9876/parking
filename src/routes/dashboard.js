const { Router } = require('express')
const dashboardController = require('../controllers/dashboard.controller')
const { auth } = require('../middlewares/auth')

const router = Router()

router.use(auth)

router.get('/stats', (req, res, next) => dashboardController.getStats(req, res, next))

module.exports = router
