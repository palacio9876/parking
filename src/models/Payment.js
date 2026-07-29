// Modelo de Pago: registra los cobros realizados por cada movimiento
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {}

  Payment.init(
    {
      id_payment: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Identificador único del pago',
      },
      id_company: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Empresa que recibe el pago',
      },
      id_movement: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Movimiento asociado al pago',
      },
      payment_method: {
        type: DataTypes.ENUM('efectivo', 'tarjeta', 'QR'),
        allowNull: false,
        comment: 'Método de pago: efectivo, tarjeta, QR',
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Monto del pago',
      },
      payment_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Fecha y hora del pago',
      },
      payment_reference: {
        type: DataTypes.STRING(100),
        comment: 'Referencia del pago (ej. número de transacción)',
      },
      id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Usuario que registró el pago',
      },
    },
    {
      sequelize,
      modelName: 'Payment',
      tableName: 'payments',
      timestamps: false,
    }
  )

  return Payment
}
