const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {}

  Payment.init(
    {
      id_pago: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_company: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_movement: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      payment_method: {
        type: DataTypes.ENUM('cash', 'card', 'QR'),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      payment_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      payment_reference: {
        type: DataTypes.STRING(100),
      },
      id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
