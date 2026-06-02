const { Router } = require('express')
const companyController = require('../controllers/company.controller')
const { auth, requireAdmin } = require('../middlewares/auth')
const { validate } = require('../middlewares/validate')
const { updateCompanyDto, updateSettingsDto } = require('../dtos/company.dto')

const router = Router()
router.use(auth)

router.get('/me',     (req, res, next) => companyController.getCompany(req, res, next))
router.get('/config', (req, res, next) => companyController.getSettings(req, res, next))
router.get('/logo',   (req, res, next) => companyController.getLogo(req, res, next))
router.post('/logo',  requireAdmin, (req, res, next) => companyController.uploadLogo(req, res, next))
router.put('/',       requireAdmin, validate(updateCompanyDto),  (req, res, next) => companyController.updateCompany(req, res, next))
router.put('/config', requireAdmin, validate(updateSettingsDto), (req, res, next) => companyController.updateSettings(req, res, next))

module.exports = router