// Migración: crea la tabla de empresas (companies)
'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('companies', {
      id_company: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Identificador único de la empresa',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre comercial de la empresa',
      },
      tax_id: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'NIT / Identificación tributaria',
      },
      address: Sequelize.STRING(200),
      phone: Sequelize.STRING(20),
      email: Sequelize.STRING(100),
      logo_url: Sequelize.BLOB('long'),
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Indica si la empresa está activa',
      },
      registration_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de registro',
      },
      expiration_date: Sequelize.DATE,
      plan: {
        type: Sequelize.ENUM('basic', 'premium', 'enterprise'),
        allowNull: false,
        comment: 'Plan de suscripción',
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('companies')
  },
}
