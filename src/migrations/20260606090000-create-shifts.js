// Migración: crea la tabla de turnos de caja (shifts)
'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('shifts', {
      id_shift: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Identificador único del turno',
      },
      id_company: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'companies', key: 'id_company' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Empresa asociada',
      },
      id_user: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id_user' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Operador que abre el turno',
      },
      opening_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha/hora de apertura',
      },
      initial_base: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        comment: 'Base inicial de efectivo',
      },
      opening_observation: Sequelize.STRING(255),
      closing_date: Sequelize.DATE,
      total_cash: Sequelize.DECIMAL(12, 2),
      total_card: Sequelize.DECIMAL(12, 2),
      total_qr: Sequelize.DECIMAL(12, 2),
      total_general: Sequelize.DECIMAL(12, 2),
      difference: Sequelize.DECIMAL(12, 2),
      closing_observation: Sequelize.STRING(255),
      status: {
        type: Sequelize.ENUM('open', 'closed'),
        allowNull: false,
        defaultValue: 'open',
        comment: 'Estado: open (abierto) / closed (cerrado)',
      },
    })

    await queryInterface.addIndex('shifts', ['id_company', 'id_user', 'status'], {
      name: 'idx_active_shift',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('shifts')
  },
}
