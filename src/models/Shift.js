const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Shift extends Model {}

  Shift.init(
    {
      id_shift: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_company: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      opening_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      initial_base: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      opening_observation: {
        type: DataTypes.STRING(255),
      },
      closing_date: {
        type: DataTypes.DATE,
      },
      total_cash: {
        type: DataTypes.DECIMAL(12, 2),
      },
      total_card: {
        type: DataTypes.DECIMAL(12, 2),
      },
      total_qr: {
        type: DataTypes.DECIMAL(12, 2),
      },
      total_general: {
        type: DataTypes.DECIMAL(12, 2),
      },
      difference: {
        type: DataTypes.DECIMAL(12, 2),
      },
      closing_observation: {
        type: DataTypes.STRING(255),
      },
      status: {
        type: DataTypes.ENUM('open', 'closed'),
        allowNull: false,
        defaultValue: 'open',
      },
    },
    {
      sequelize,
      modelName: 'Shift',
      tableName: 'shifts',
      timestamps: false,
      indexes: [
        {
          fields: ['id_company', 'id_user', 'status'],
        },
      ],
    }
  )

  return Shift
}
