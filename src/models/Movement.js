const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Movement extends Model {}

  Movement.init(
    {
      id_movement: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_company: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_vehicle: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      entry_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      exit_date: {
        type: DataTypes.DATE,
      },
      id_rate: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total_to_pay: {
        type: DataTypes.DECIMAL(10, 2),
      },
      id_user_entry: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_user_exit: {
        type: DataTypes.INTEGER,
      },
      status: {
        type: DataTypes.ENUM('active', 'completed'),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    {
      sequelize,
      modelName: 'Movement',
      tableName: 'movements',
      timestamps: false,
    }
  )

  return Movement
}
