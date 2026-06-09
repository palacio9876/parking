// Modelo de Vehículo: registro de vehículos que ingresan al parqueadero
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Vehicle extends Model {}

  Vehicle.init(
    {
      id_vehicle: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Identificador único del vehículo',
      },
      id_company: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Empresa propietaria del registro',
      },
      license_plate: {
        type: DataTypes.STRING(10),
        allowNull: false,
        comment: 'Placa del vehículo',
      },
      type: {
        type: DataTypes.ENUM('car', 'motorcycle', 'bicycle'),
        allowNull: false,
        comment: 'Tipo de vehículo: car (carro), motorcycle (moto), bicycle (bicicleta)',
      },
      color: {
        type: DataTypes.STRING(30),
        allowNull: false,
        comment: 'Color del vehículo',
      },
      model: {
        type: DataTypes.STRING(50),
        comment: 'Modelo/marca del vehículo',
      },
      registration_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Fecha de registro del vehículo en el sistema',
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
