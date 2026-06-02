const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class CompanySetting extends Model {}

  CompanySetting.init(
    {
      id_setting: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_company: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      car_total_capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50,
      },
      motorcycle_total_capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
      },
      bicycle_total_capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 20,
      },
      opening_time: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: '06:00:00',
      },
      closing_time: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: '22:00:00',
      },
      vat_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 19.0,
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'COP',
      },
      timezone: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'America/Bogota',
      },
      operation_24h: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'CompanySetting',
      tableName: 'company_settings',
      timestamps: false,
    }
  )

  return CompanySetting
}
