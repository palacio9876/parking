// Controlador de reportes: KPIs, ingresos, movimientos, turnos y exportaciones
const reportService = require('../services/report.service')

class ReportController {

  /**
   * GET /api/reports/kpis
   * Indicadores clave: ingresos, tickets, ocupación
   */
  async getKPIs(req, res, next) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { from = today, to = today } = req.query
      const result = await reportService.getKPIs(req.user.id_company, from, to)
      res.json(result)
    } catch (err) { next(err) }
  }

  /**
   * GET /api/reports/income-by-day
   * Ingresos agrupados por día
   */
  async getIncomeByDay(req, res, next) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { from = today, to = today, paymentMethod } = req.query
      const result = await reportService.getIncomeByDay(req.user.id_company, from, to, paymentMethod)
      res.json(result)
    } catch (err) { next(err) }
  }

  /**
   * GET /api/reports/income-by-payment-method
   * Ingresos agrupados por método de pago
   */
  async getIncomeByMethod(req, res, next) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { from = today, to = today } = req.query
      const result = await reportService.getIncomeByMethod(req.user.id_company, from, to)
      res.json(result)
    } catch (err) { next(err) }
  }

  /**
   * GET /api/reports/movements
   * Listado de movimientos con paginación y filtros
   */
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

  /**
   * GET /api/reports/top-plates
   * Placas más frecuentes en el rango de fechas
   */
  async getTopPlates(req, res, next) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { from = today, to = today, limit = 10 } = req.query
      const result = await reportService.getTopPlates(req.user.id_company, from, to, parseInt(limit))
      res.json(result)
    } catch (err) { next(err) }
  }

  /**
   * GET /api/reports/shifts
   * Turnos de caja en el rango de fechas
   */
  async getShifts(req, res, next) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { from = today, to = today, user } = req.query
      const result = await reportService.getShifts(req.user.id_company, from, to, user)
      res.json(result)
    } catch (err) { next(err) }
  }

  /**
   * GET /api/reports/shifts/export/xlsx
   * Exportar turnos a Excel (pendiente de implementar)
   */
  async exportShiftsXlsx(req, res, next) {
    try {
      res.json({ success: true, message: 'Export not yet implemented' })
    } catch (err) { next(err) }
  }

  /**
   * GET /api/reports/export/xlsx
   * Exportar movimientos a Excel (pendiente de implementar)
   */
  async exportMovementsXlsx(req, res, next) {
    try {
      res.json({ success: true, message: 'Export not yet implemented' })
    } catch (err) { next(err) }
  }
}

module.exports = new ReportController()