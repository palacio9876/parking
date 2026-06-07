'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rates', {
      id_rate: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_company: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'companies', key: 'id_company' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      vehicle_type: {
        type: Sequelize.ENUM('car', 'motorcycle', 'bicycle'),
        allowNull: false,
      },
      hourly_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      minute_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      full_day_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      effective_from: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      effective_until: Sequelize.DATE,
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      billing_mode: {
        type: Sequelize.ENUM('minute', 'hour', 'day', 'mixed'),
        allowNull: false,
        defaultValue: 'mixed',
      },
      minutes_to_hours_threshold: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      hours_to_days_threshold: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      hourly_rounding: {
        type: Sequelize.ENUM('up', 'exact'),
        allowNull: false,
        defaultValue: 'up',
      },
      daily_rounding: {
        type: Sequelize.ENUM('up', 'exact'),
        allowNull: false,
        defaultValue: 'up',
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('rates')
  },
}
