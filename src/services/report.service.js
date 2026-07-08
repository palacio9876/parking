// Servicio de reportes: lógica de negocio para generar informes y análisis
const reportRepo = require('../repositories/report.repository')

class ReportService {

  /**
   * Obtiene KPIs: ingresos, tickets, ticket promedio, ocupación actual
   * @param {number} id_company - ID de la empresa
   * @param {string} from - Fecha inicio (YYYY-MM-DD)
   * @param {string} to - Fecha fin (YYYY-MM-DD)
   * @returns {object} { success, data: { income, tickets, averageTicket, activeCount, occupancy } }
   */
  async getKPIs(id_company, from, to) {
    const [kpis, activeCount, capacity] = await Promise.all([
      reportRepo.getKPIs(id_company, from, to),
      reportRepo.getActiveCount(id_company),
      reportRepo.getCapacity(id_company)
    ])

    const income       = Number(kpis?.income || 0)
    const tickets      = Number(kpis?.tickets || 0)
    const averageTicket= tickets > 0 ? income / tickets : 0
    const totalCap     = Number(capacity?.car_total_capacity || 0)
                       + Number(capacity?.motorcycle_total_capacity || 0)
                       + Number(capacity?.bicycle_total_capacity || 0)
    const occupancy    = totalCap > 0 ? Math.min(100, Math.round((activeCount / totalCap) * 100)) : 0

    return {
      success: true,
      data: { income, tickets, averageTicket, activeCount, occupancy }
    }
  }

  /**
   * Obtiene ingresos agrupados por día
   * @param {number} id_company - ID de la empresa
   * @param {string} from - Fecha inicio
   * @param {string} to - Fecha fin
   * @param {string} [paymentMethod] - Filtrar por método de pago
   * @returns {object} { success, data }
   */
  async getIncomeByDay(id_company, from, to, paymentMethod) {
    const data = await reportRepo.getIncomeByDay(id_company, from, to, paymentMethod)
    return { success: true, data }
  }

  /**
   * Obtiene ingresos agrupados por método de pago
   * @param {number} id_company - ID de la empresa
   * @param {string} from - Fecha inicio
   * @param {string} to - Fecha fin
   * @returns {object} { success, data }
   */
  async getIncomeByMethod(id_company, from, to) {
    const data = await reportRepo.getIncomeByMethod(id_company, from, to)
    return { success: true, data }
  }

  /**
   * Obtiene movimientos con paginación y filtros
   * @param {number} id_company - ID de la empresa
   * @param {string} from - Fecha inicio
   * @param {string} to - Fecha fin
   * @param {number} pageSize - Tamaño de página
   * @param {number} page - Número de página
   * @param {object} filters - { type, status, plate }
   * @returns {object} { success, data, paging }
   */
  async getMovements(id_company, from, to, pageSize = 20, page = 0, filters = {}) {
    const limit  = pageSize
    const offset = page * pageSize
    const { data, total } = await reportRepo.getMovements(id_company, from, to, limit, offset, filters)
    return {
      success: true,
      data,
      paging: { page, pageSize, total, hasNext: offset + limit < total }
    }
  }

  /**
   * Obtiene el top de placas más frecuentes
   * @param {number} id_company - ID de la empresa
   * @param {string} from - Fecha inicio
   * @param {string} to - Fecha fin
   * @param {number} limit - Cantidad máxima de resultados
   * @returns {object} { success, data }
   */
  async getTopPlates(id_company, from, to, limit = 10) {
    const data = await reportRepo.getTopPlates(id_company, from, to, limit)
    return { success: true, data }
  }

  /**
   * Obtiene todos los movimientos sin paginación para exportación
   */
  async getAllMovements(id_company, from, to, filters = {}) {
    return reportRepo.getAllMovements(id_company, from, to, filters)
  }

  /**
   * Obtiene todos los datos consolidados para el reporte PDF
   */
  async getReportData(id_company, from, to, filters = {}) {
    const [kpis, incomeByDay, incomeByMethod, movements, topPlates] = await Promise.all([
      this.getKPIs(id_company, from, to),
      reportRepo.getIncomeByDay(id_company, from, to),
      reportRepo.getIncomeByMethod(id_company, from, to),
      reportRepo.getAllMovements(id_company, from, to, filters),
      reportRepo.getAllTopPlates(id_company, from, to)
    ])
    return { kpis: kpis.data, incomeByDay, incomeByMethod, movements, topPlates }
  }

  /**
   * Obtiene los turnos (shifts) en un rango de fechas
   * @param {number} id_company - ID de la empresa
   * @param {string} from - Fecha inicio
   * @param {string} to - Fecha fin
   * @param {string} [username] - Filtro por nombre de usuario
   * @returns {object} { success, data }
   */
  async getShifts(id_company, from, to, username) {
    const data = await reportRepo.getShifts(id_company, from, to, username)
    return { success: true, data }
  }
}

module.exports = new ReportService()