const reportRepo = require('../repositories/report.repository')

class ReportService {

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

  async getIncomeByDay(id_company, from, to, paymentMethod) {
    const data = await reportRepo.getIncomeByDay(id_company, from, to, paymentMethod)
    return { success: true, data }
  }

  async getIncomeByMethod(id_company, from, to) {
    const data = await reportRepo.getIncomeByMethod(id_company, from, to)
    return { success: true, data }
  }

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

  async getTopPlates(id_company, from, to, limit = 10) {
    const data = await reportRepo.getTopPlates(id_company, from, to, limit)
    return { success: true, data }
  }

  async getShifts(id_company, from, to, username) {
    const data = await reportRepo.getShifts(id_company, from, to, username)
    return { success: true, data }
  }
}

module.exports = new ReportService()