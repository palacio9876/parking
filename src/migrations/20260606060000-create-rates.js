// Migración: crea la tabla de tarifas (rates)
'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rates', {
      id_rate: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Identificador único de la tarifa',
      },
      id_company: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'companies', key: 'id_company' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Empresa asociada',
      },
      vehicle_type: {
        type: Sequelize.ENUM('car', 'motorcycle', 'bicycle'),
        allowNull: false,
        comment: 'Tipo de vehículo',
      },
      hourly_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Valor por hora',
      },
      minute_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Valor por minuto',
      },
      full_day_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Valor por día completo',
      },
      effective_from: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Inicio de vigencia',
      },
      effective_until: Sequelize.DATE,
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Tarifa activa',
      },
      billing_mode: {
        type: Sequelize.ENUM('minute', 'hour', 'day', 'mixed'),
        allowNull: false,
        defaultValue: 'mixed',
        comment: 'Modo de cobro',
      },
      minutes_to_hours_threshold: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Umbral minutos->hora',
      },
      hours_to_days_threshold: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Umbral horas->día',
      },
      hourly_rounding: {
        type: Sequelize.ENUM('up', 'exact'),
        allowNull: false,
        defaultValue: 'up',
        comment: 'Redondeo de horas',
      },
      daily_rounding: {
        type: Sequelize.ENUM('up', 'exact'),
        allowNull: false,
        defaultValue: 'up',
        comment: 'Redondeo de días',
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('rates')
  },
}
