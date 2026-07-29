// Servicio del dashboard: lógica para obtener las estadísticas de la pantalla principal
const dashboardRepo = require('../repositories/dashboard.repository')

class DashboardService {

  /**
   * Obtiene estadísticas generales del dashboard en paralelo
   * @param {number} id_company - ID de la empresa
   * @param {number} pageSize - Tamaño de página para actividad reciente
   * @param {number} page - Número de página
   * @returns {object} { success, data: { currentVehiclesByType, todayIncome, totalUsers, recentActivity, paging } }
   */
  async getStats(id_company, pageSize = 5, page = 0) {
    const offset = page * pageSize

    const [activeByType, todayIncome, totalUsers, recentActivity, totalMovements] = await Promise.all([
      dashboardRepo.getActiveVehiclesByType(id_company),
      dashboardRepo.getTodayIncome(id_company),
      dashboardRepo.getTotalActiveUsers(id_company),
      dashboardRepo.getRecentActivity(id_company, pageSize, offset),
      dashboardRepo.getMovementCount(id_company)
    ])

    return {
      success: true,
      data: {
        currentVehiclesByType: activeByType,
        todayIncome,
        totalUsers,
        recentActivity,
        paging: {
          page,
          pageSize,
          total: totalMovements,
          hasNext: offset + pageSize < totalMovements
        }
      }
    }
  }
}

module.exports = new DashboardService()
