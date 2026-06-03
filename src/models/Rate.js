const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Rate extends Model {}

  Rate.init(
    {
      id_rate: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_company: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      vehicle_type: {
        type: DataTypes.ENUM('car', 'motorcycle', 'bicycle'),
        allowNull: false,
      },
      hourly_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      minute_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      full_day_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      effective_from: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      effective_until: {
        type: DataTypes.DATE,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      billing_mode: {
        type: DataTypes.ENUM('minute', 'hour', 'day', 'mixed'),
        allowNull: false,
        defaultValue: 'mixed',
      },
      minutes_to_hours_threshold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      hours_to_days_threshold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      hourly_rounding: {
        type: DataTypes.ENUM('up', 'exact'),
        allowNull: false,
        defaultValue: 'up',
      },
      daily_rounding: {
        type: DataTypes.ENUM('up', 'exact'),
        allowNull: false,
        defaultValue: 'up',
      },
    },
    {
      sequelize,
      modelName: 'Rate',
      tableName: 'rates',
      timestamps: false,
    }
  )

  return Rate
}
