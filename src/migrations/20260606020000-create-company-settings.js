// Migración: crea la tabla de configuración de empresas (company_settings)
'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('company_settings', {
      id_setting: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Identificador único de la configuración',
      },
      id_company: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'companies', key: 'id_company' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Empresa asociada',
      },
      car_total_capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 50,
        comment: 'Capacidad de carros',
      },
      motorcycle_total_capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30,
        comment: 'Capacidad de motos',
      },
      bicycle_total_capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 20,
        comment: 'Capacidad de bicicletas',
      },
      opening_time: {
        type: Sequelize.TIME,
        defaultValue: '06:00:00',
        comment: 'Hora de apertura',
      },
      closing_time: {
        type: Sequelize.TIME,
        defaultValue: '22:00:00',
        comment: 'Hora de cierre',
      },
      vat_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 19.00,
        comment: 'Porcentaje de IVA',
      },
      currency: {
        type: Sequelize.STRING(10),
        defaultValue: 'COP',
        comment: 'Moneda',
      },
      timezone: {
        type: Sequelize.STRING(50),
        defaultValue: 'America/Bogota',
        comment: 'Zona horaria',
      },
      operation_24h: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Operación 24 horas',
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('company_settings')
  },
}
