// Controlador de reportes: KPIs, ingresos, movimientos, turnos y exportaciones
const reportService = require('../services/report.service')
const ExcelJS = require('exceljs')
const PDFDocument = require('pdfkit')

const vehicleTypes = { carro: 'Carro', moto: 'Moto', bicicleta: 'Bicicleta' }
const statusMap = { activo: 'Activo', completado: 'Finalizado', inactive: 'Inactivo' }
const paymentMethods = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', QR: 'QR' }

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
   * Exportar turnos a Excel
   */
  async exportShiftsXlsx(req, res, next) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { from = today, to = today, user } = req.query
      const result = await reportService.getShifts(req.user.id_company, from, to, user)
      const shifts = result.data

      const workbook = new ExcelJS.Workbook()
      const sheet = workbook.addWorksheet('Turnos')

      sheet.columns = [
        { header: '#', key: 'index', width: 6 },
        { header: 'Apertura', key: 'opening_date', width: 22 },
        { header: 'Cierre', key: 'closing_date', width: 22 },
        { header: 'Usuario', key: 'user', width: 20 },
        { header: 'Base', key: 'initial_base', width: 14 },
        { header: 'Efectivo', key: 'total_cash', width: 14 },
        { header: 'Tarjeta', key: 'total_card', width: 14 },
        { header: 'QR', key: 'total_qr', width: 14 },
        { header: 'Total', key: 'total_general', width: 14 },
        { header: 'Diferencia', key: 'difference', width: 14 }
      ]

      shifts.forEach((s, i) => {
        const userName = s.user?.name || s.username || ''
        sheet.addRow({
          index: i + 1,
          opening_date: s.opening_date,
          closing_date: s.closing_date || '',
          user: userName,
          initial_base: Number(s.initial_base || 0),
          total_cash: Number(s.total_cash || 0),
          total_card: Number(s.total_card || 0),
          total_qr: Number(s.total_qr || 0),
          total_general: Number(s.total_general || 0),
          difference: Number(s.difference || 0)
        })
      })

      sheet.getRow(1).font = { bold: true }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename=turnos_${from}_${to}.xlsx`)
      await workbook.xlsx.write(res)
      res.end()
    } catch (err) { next(err) }
  }

  /**
   * GET /api/reports/export/xlsx
   * Exportar movimientos a Excel
   */
  async exportMovementsXlsx(req, res, next) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { from = today, to = today, type, status, plate } = req.query
      const movements = await reportService.getAllMovements(
        req.user.id_company, from, to,
        { type, status, plate }
      )

      const workbook = new ExcelJS.Workbook()
      const sheet = workbook.addWorksheet('Movimientos')

      sheet.columns = [
        { header: '#Mov', key: 'id', width: 8 },
        { header: 'Placa', key: 'license_plate', width: 14 },
        { header: 'Tipo', key: 'type', width: 14 },
        { header: 'Entrada', key: 'entry_date', width: 22 },
        { header: 'Salida', key: 'exit_date', width: 22 },
        { header: 'Estado', key: 'status', width: 12 },
        { header: 'Total', key: 'total_to_pay', width: 14 }
      ]

      movements.forEach(m => {
        sheet.addRow({
          id: m.id,
          license_plate: m.license_plate,
          type: vehicleTypes[m.type] || m.type,
          entry_date: m.entry_date,
          exit_date: m.exit_date || '',
          status: statusMap[m.status] || m.status,
          total_to_pay: m.total_to_pay != null ? Number(m.total_to_pay) : ''
        })
      })

      sheet.getRow(1).font = { bold: true }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename=movimientos_${from}_${to}.xlsx`)
      await workbook.xlsx.write(res)
      res.end()
    } catch (err) { next(err) }
  }

  /**
   * GET /api/reports/export/pdf
   * Exportar reporte completo a PDF
   */
  async exportPDF(req, res, next) {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { from = today, to = today, type, status, plate } = req.query
      const data = await reportService.getReportData(
        req.user.id_company, from, to,
        { type, status, plate }
      )

      const doc = new PDFDocument({ margin: 30, size: 'A4' })

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename=reporte_${from}_${to}.pdf`)
      doc.pipe(res)

      const locale = 'es-CO'
      // -- Header --
      doc.fontSize(18).font('Helvetica-Bold').text('PARKSYSTEM', { align: 'center' })
      doc.fontSize(10).font('Helvetica').text(`Desde: ${from} Hasta: ${to}`, { align: 'center' })
      doc.moveDown(0.5)

      const generatedAt = new Date().toLocaleString(locale)
      doc.fontSize(8).fillColor('#666').text(`Fecha impresión: ${generatedAt}`, { align: 'center' })
      doc.fillColor('#000')
      doc.moveDown()

      // -- KPIs --
      doc.fontSize(14).font('Helvetica-Bold').text('Ingresos')
      doc.moveDown(0.3)

      const kpis = data.kpis
      const kpiData = [
        { label: 'Ingresos', value: `$${Number(kpis.income || 0).toLocaleString(locale, { minimumFractionDigits: 2 })}` },
        { label: 'Tickets', value: String(kpis.tickets || 0) },
        { label: 'Promedio Ticket', value: `$${Number(kpis.averageTicket || 0).toLocaleString(locale, { minimumFractionDigits: 2 })}` },
        { label: 'Ocupación', value: `${kpis.occupancy || 0}%` },
        { label: 'Vehículos Actuales (por tipo) (Activos)', value: String(kpis.activeCount || 0) }
      ]

      kpiData.forEach(k => {
        doc.fontSize(10).font('Helvetica-Bold').text(`${k.label}: `, { continued: true })
        doc.font('Helvetica').text(k.value)
      })
      doc.moveDown()

      // -- Income by Payment Method --
      doc.fontSize(14).font('Helvetica-Bold').text('Ingresos por método')
      doc.moveDown(0.3)

      if (data.incomeByMethod.length > 0) {
        const methodTable = {
          headers: ['Tipo', 'Total', 'Tickets'],
          rows: data.incomeByMethod.map(r => [
            paymentMethods[r.payment_method] || r.payment_method,
            `$${Number(r.total || 0).toLocaleString(locale, { minimumFractionDigits: 2 })}`,
            String(r.count || 0)
          ])
        }
        drawTable(doc, methodTable)
      } else {
        doc.fontSize(10).font('Helvetica').text('Sin registros')
      }
      doc.moveDown()

      // -- Income by Day --
      doc.fontSize(14).font('Helvetica-Bold').text('Ingresos por día')
      doc.moveDown(0.3)

      if (data.incomeByDay.length > 0) {
        const dayTable = {
          headers: ['Desde', 'Total'],
          rows: data.incomeByDay.map(r => [
            r.date,
            `$${Number(r.total || 0).toLocaleString(locale, { minimumFractionDigits: 2 })}`
          ])
        }
        drawTable(doc, dayTable)
      } else {
        doc.fontSize(10).font('Helvetica').text('Sin registros')
      }
      doc.moveDown()

      // -- Top Plates --
      doc.fontSize(14).font('Helvetica-Bold').text('Top Placas')
      doc.moveDown(0.3)

      if (data.topPlates.length > 0) {
        const topTable = {
          headers: ['Placa', 'Tipo', 'Visitas', 'Total'],
          rows: data.topPlates.map(r => {
            const vtype = r['vehicle.type'] || r.type || ''
            return [
              r['vehicle.license_plate'] || r.license_plate || '',
              vtype ? (vehicleTypes[vtype] || vtype) : '',
              String(r.visits || 0),
              `$${Number(r.total || 0).toLocaleString(locale, { minimumFractionDigits: 2 })}`
            ]
          })
        }
        drawTable(doc, topTable)
      } else {
        doc.fontSize(10).font('Helvetica').text('Sin registros')
      }
      doc.moveDown()

      // -- Movements --
      doc.fontSize(14).font('Helvetica-Bold').text(`Movimientos (${data.movements.length})`)
      doc.moveDown(0.3)

      if (data.movements.length > 0) {
        const movTable = {
          headers: ['#Mov', 'Placa', 'Tipo', 'Entrada', 'Salida', 'Estado', 'Total'],
          rows: data.movements.map(m => [
            String(m.id),
            m.license_plate || '',
            vehicleTypes[m.type] || m.type,
            m.entry_date ? new Date(m.entry_date).toLocaleString(locale) : '',
            m.exit_date ? new Date(m.exit_date).toLocaleString(locale) : '',
            statusMap[m.status] || m.status,
            m.total_to_pay != null ? `$${Number(m.total_to_pay).toLocaleString(locale, { minimumFractionDigits: 2 })}` : ''
          ])
        }
        drawTable(doc, movTable)
      } else {
        doc.fontSize(10).font('Helvetica').text('Sin registros')
      }

      doc.end()
    } catch (err) { next(err) }
  }
}

function drawTable(doc, table) {
  const startX = doc.x
  let startY = doc.y
  const columnWidth = Math.min(480 / table.headers.length, 120)
  const rowHeight = 16

  const isBold = true

  // Check if we need a new page
  const estimatedHeight = (table.rows.length + 1) * rowHeight + 20
  if (startY + estimatedHeight > doc.page.height - doc.page.margins.bottom) {
    doc.addPage()
    startY = doc.y
  }

  // Draw header
  doc.font('Helvetica-Bold').fontSize(8)
  table.headers.forEach((header, i) => {
    const x = startX + i * columnWidth
    doc.rect(x, startY, columnWidth, rowHeight).fill('#2563eb')
    doc.fillColor('#fff').text(header, x + 3, startY + 4, {
      width: columnWidth - 6,
      align: 'left'
    })
    doc.fillColor('#000')
  })

  doc.font('Helvetica').fontSize(7)

  // Draw rows
  table.rows.forEach((row, rowIndex) => {
    const y = startY + (rowIndex + 1) * rowHeight
    if (rowIndex % 2 === 0) {
      doc.rect(startX, y, columnWidth * table.headers.length, rowHeight).fill('#f3f4f6')
      doc.fillColor('#000')
    }
    row.forEach((cell, i) => {
      const x = startX + i * columnWidth
      doc.text(cell, x + 3, y + 4, {
        width: columnWidth - 6,
        align: 'left'
      })
    })
  })

  doc.moveDown(1.5)
}

module.exports = new ReportController()
