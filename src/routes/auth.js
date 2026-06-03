// src/routes/auth.js
const { Router }         = require('express')
const authController     = require('../controllers/auth.controller')
const { auth }           = require('../middlewares/auth')
const { validate }       = require('../middlewares/validate')
const { loginDto }       = require('../dtos/auth.dto')

const router = Router()

router.post('/login', validate(loginDto), (req, res, next) => authController.login(req, res, next))
router.get('/me',     auth,               (req, res, next) => authController.me(req, res, next))

module.exports = router