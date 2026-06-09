// Modelo de Turno (Caja): apertura y cierre de caja por operador
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Shift extends Model {}

  Shift.init(
    {
      id_shift: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Identificador único del turno',
      },
      id_company: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Empresa a la que pertenece el turno',
      },
      id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Usuario (operador) que abre el turno',
      },
      opening_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Fecha y hora de apertura del turno',
      },
      initial_base: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        comment: 'Base inicial de efectivo en caja',
      },
      opening_observation: {
        type: DataTypes.STRING(255),
        comment: 'Observación al abrir el turno',
      },
      closing_date: {
        type: DataTypes.DATE,
        comment: 'Fecha y hora de cierre del turno',
      },
      total_cash: {
        type: DataTypes.DECIMAL(12, 2),
        comment: 'Total recaudado en efectivo durante el turno',
      },
      total_card: {
        type: DataTypes.DECIMAL(12, 2),
        comment: 'Total recaudado con tarjeta durante el turno',
      },
      total_qr: {
        type: DataTypes.DECIMAL(12, 2),
        comment: 'Total recaudado con QR durante el turno',
      },
      total_general: {
        type: DataTypes.DECIMAL(12, 2),
        comment: 'Total general recaudado (cash + card + qr)',
      },
      difference: {
        type: DataTypes.DECIMAL(12, 2),
        comment: 'Diferencia entre total general y base inicial',
      },
      closing_observation: {
        type: DataTypes.STRING(255),
        comment: 'Observación al cerrar el turno',
      },
      status: {
        type: DataTypes.ENUM('open', 'closed'),
        allowNull: false,
        defaultValue: 'open',
        comment: 'Estado del turno: open (abierto) o closed (cerrado)',
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
