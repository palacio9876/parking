// Controlador del dashboard: estadísticas generales para la pantalla principal
const dashboardService = require('../services/dashboard.service')

class DashboardController {

  /**
   * GET /api/dashboard/stats
   * Obtiene estadísticas en tiempo real del parqueadero
   */
  async getStats(req, res, next) {
    try {
      const { pageSize = 5, page = 0 } = req.query
      const result = await dashboardService.getStats(
        req.user.id_company,
        parseInt(pageSize),
        parseInt(page)
      )
      res.json(result)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new DashboardController()
