'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('companies', {
      id_company: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      tax_id: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      address: Sequelize.STRING(200),
      phone: Sequelize.STRING(20),
      email: Sequelize.STRING(100),
      logo_url: Sequelize.BLOB('long'),
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      registration_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      expiration_date: Sequelize.DATE,
      plan: {
        type: Sequelize.ENUM('basic', 'premium', 'enterprise'),
        allowNull: false,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('companies')
  },
}
