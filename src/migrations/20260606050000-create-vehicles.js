'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vehicles', {
      id_vehicle: {
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
      license_plate: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('car', 'motorcycle', 'bicycle'),
        allowNull: false,
      },
      color: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      model: Sequelize.STRING(50),
      registration_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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
