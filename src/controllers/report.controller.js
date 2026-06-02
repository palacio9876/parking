const reportService = require('../services/report.service')

class ReportController {

  async getKPIs(req, res, next) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { from = today, to = today } = req.query
      const result = await reportService.getKPIs(req.user.id_company, from, to)
      res.json(result)
    } catch (err) { next(err) }
  }

  async getIncomeByDay(req, res, next) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { from = today, to = today, paymentMethod } = req.query
      const result = await reportService.getIncomeByDay(req.user.id_company, from, to, paymentMethod)
      res.json(result)
    } catch (err) { next(err) }
  }

  async getIncomeByMethod(req, res, next) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { from = today, to = today } = req.query
      const result = await reportService.getIncomeByMethod(req.user.id_company, from, to)
      res.json(result)
    } catch (err) { next(err) }
  }

  async getMovements(req, res, next) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { from = today, to = today, page = 0, pageSize = 20, type, status, plate } = req.query
      const result = await reportService.getMovements(
        req.user.id_company, from, to,
        parseInt(pageSize), parseInt(page),
        { type, status, plate }
      )
      res.json(result)
    } catch (err) { next(err) }
  }

  async getTopPlates(req, res, next) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { from = today, to = today, limit = 10 } = req.query
      const result = await reportService.getTopPlates(req.user.id_company, from, to, parseInt(limit))
      res.json(result)
    } catch (err) { next(err) }
  }

  async getShifts(req, res, next) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { from = today, to = today, user } = req.query
      const result = await reportService.getShifts(req.user.id_company, from, to, user)
      res.json(result)
    } catch (err) { next(err) }
  }

  async exportShiftsXlsx(req, res, next) {
    try {
      res.json({ success: true, message: 'Export not yet implemented' })
    } catch (err) { next(err) }
  }

  async exportMovementsXlsx(req, res, next) {
    try {
      res.json({ success: true, message: 'Export not yet implemented' })
    } catch (err) { next(err) }
  }
}

module.exports = new ReportController()