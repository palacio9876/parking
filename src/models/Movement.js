// Modelo de Movimiento (Entrada/Salida): registra cada ingreso y egreso del parqueadero
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Movement extends Model {}

  Movement.init(
    {
      id_movement: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Identificador único del movimiento',
      },
      id_company: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Empresa a la que pertenece el movimiento',
      },
      id_vehicle: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Vehículo que ingresó/salió',
      },
      entry_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Fecha y hora de entrada',
      },
      exit_date: {
        type: DataTypes.DATE,
        comment: 'Fecha y hora de salida (null si sigue dentro)',
      },
      id_rate: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Tarifa aplicada al momento de entrada',
      },
      total_to_pay: {
        type: DataTypes.DECIMAL(10, 2),
        comment: 'Total calculado a pagar (se completa al salir)',
      },
      id_user_entry: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Usuario que registró la entrada',
      },
      id_user_exit: {
        type: DataTypes.INTEGER,
        comment: 'Usuario que registró la salida (null si sigue dentro)',
      },
      status: {
        type: DataTypes.ENUM('active', 'completed'),
        allowNull: false,
        defaultValue: 'active',
        comment: 'Estado: active (dentro) o completed (fuera)',
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
