'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('company_settings', {
      id_setting: {
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
      car_total_capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 50,
      },
      motorcycle_total_capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30,
      },
      bicycle_total_capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 20,
      },
      opening_time: {
        type: Sequelize.TIME,
        defaultValue: '06:00:00',
      },
      closing_time: {
        type: Sequelize.TIME,
        defaultValue: '22:00:00',
      },
      vat_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 19.00,
      },
      currency: {
        type: Sequelize.STRING(10),
        defaultValue: 'COP',
      },
      timezone: {
        type: Sequelize.STRING(50),
        defaultValue: 'America/Bogota',
      },
      operation_24h: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('company_settings')
  },
}
