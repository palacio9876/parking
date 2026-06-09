// Migración: crea la tabla de movimientos (entradas/salidas)
'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('movements', {
      id_movement: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Identificador único del movimiento',
      },
      id_company: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'companies', key: 'id_company' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Empresa asociada',
      },
      id_vehicle: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'vehicles', key: 'id_vehicle' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Vehículo que ingresa/sale',
      },
      entry_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha/hora de entrada',
      },
      exit_date: Sequelize.DATE,
      id_rate: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'rates', key: 'id_rate' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Tarifa aplicada',
      },
      total_to_pay: Sequelize.DECIMAL(10, 2),
      id_user_entry: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id_user' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Usuario que registró entrada',
      },
      id_user_exit: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id_user' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Usuario que registró salida',
      },
      status: {
        type: Sequelize.ENUM('active', 'completed'),
        defaultValue: 'active',
        comment: 'Estado: active (dentro) / completed (fuera)',
      },
    })

    await queryInterface.addIndex('movements', ['id_company', 'entry_date'], {
      name: 'idx_company_movements',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('movements')
  },
}
