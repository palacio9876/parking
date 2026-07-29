// Migración: crea la tabla de pagos (payments)
'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id_payment: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Identificador único del pago',
      },
      id_company: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'companies', key: 'id_company' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Empresa que recibe el pago',
      },
      id_movement: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'movements', key: 'id_movement' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Movimiento asociado',
      },
      payment_method: {
        type: Sequelize.ENUM('efectivo', 'tarjeta', 'QR'),
        allowNull: false,
        comment: 'Método de pago: cash, card, QR',
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Monto del pago',
      },
      payment_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha del pago',
      },
      payment_reference: Sequelize.STRING(100),
      id_user: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id_user' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Usuario que registró el pago',
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
