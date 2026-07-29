// Migración: crea la tabla de vehículos (vehicles)
'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vehicles', {
      id_vehicle: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Identificador único del vehículo',
      },
      id_company: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'companies', key: 'id_company' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Empresa propietaria del registro',
      },
      license_plate: {
        type: Sequelize.STRING(10),
        allowNull: false,
        comment: 'Placa del vehículo',
      },
      type: {
        type: Sequelize.ENUM('carro', 'moto', 'bicicleta'),
        allowNull: false,
        comment: 'Tipo: car (carro), motorcycle (moto), bicycle (bicicleta)',
      },
      color: {
        type: Sequelize.STRING(30),
        allowNull: false,
        comment: 'Color del vehículo',
      },
      model: Sequelize.STRING(50),
      registration_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de registro',
      },
    })

    await queryInterface.addConstraint('vehicles', {
      fields: ['license_plate', 'id_company'],
      type: 'unique',
      name: 'uq_plate_company',
    })

    await queryInterface.addIndex('vehicles', ['id_company', 'license_plate'], {
      name: 'idx_company_vehicle',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('vehicles')
  },
}
