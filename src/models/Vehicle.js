const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Vehicle extends Model {}

  Vehicle.init(
    {
      id_vehicle: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_company: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      license_plate: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('car', 'motorcycle', 'bicycle'),
        allowNull: false,
      },
      color: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      model: {
        type: DataTypes.STRING(50),
      },
      registration_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Vehicle',
      tableName: 'vehicles',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['license_plate', 'id_company'],
        },
      ],
    }
  )

  return Vehicle
}
