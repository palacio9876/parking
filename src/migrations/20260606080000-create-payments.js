'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id_payment: {
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
      id_movement: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'movements', key: 'id_movement' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      payment_method: {
        type: Sequelize.ENUM('cash', 'card', 'QR'),
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      payment_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      payment_reference: Sequelize.STRING(100),
      id_user: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id_user' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    })

    await queryInterface.addIndex('payments', ['id_company', 'payment_date'], {
      name: 'idx_company_payments',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payments')
  },
}
