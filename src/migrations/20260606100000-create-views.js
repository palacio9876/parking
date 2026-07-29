// Migración: crea vistas para consultas frecuentes (movimientos activos e ingresos diarios)
'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    // Vista: movimientos activos (vehículos dentro del parqueadero)
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW v_active_movements AS
      SELECT
        m.id_movement,
        m.id_company,
        v.license_plate,
        v.type,
        m.entry_date,
        TIMEDIFF(CURRENT_TIMESTAMP, m.entry_date) AS elapsed_time,
        u.name AS registered_by
      FROM movements m
      JOIN vehicles v ON m.id_vehicle = v.id_vehicle
      JOIN users u ON m.id_user_entry = u.id_user
      WHERE m.exit_date IS NULL
    `)

    // Vista: ingresos diarios agrupados por método de pago
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW v_daily_income AS
      SELECT
        p.id_company,
        DATE(p.payment_date) AS date,
        p.payment_method,
        COUNT(*) AS payment_count,
        SUM(p.amount) AS total_income
      FROM payments p
      GROUP BY p.id_company, DATE(payment_date), p.payment_method
    `)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS v_active_movements')
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS v_daily_income')
  },
}
