'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('movements', {
      id_movement: {
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
      id_vehicle: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'vehicles', key: 'id_vehicle' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      entry_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      exit_date: Sequelize.DATE,
      id_rate: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'rates', key: 'id_rate' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      total_to_pay: Sequelize.DECIMAL(10, 2),
      id_user_entry: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id_user' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_user_exit: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id_user' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      status: {
        type: Sequelize.ENUM('active', 'completed'),
        defaultValue: 'active',
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
