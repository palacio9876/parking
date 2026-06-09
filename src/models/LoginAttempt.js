// Modelo de Intentos de Inicio de Sesión: auditoría y control de bloqueos
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class LoginAttempt extends Model {}

  LoginAttempt.init(
    {
      id_attempt: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Identificador único del intento',
      },
      id_company: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Empresa asociada al intento',
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Nombre de usuario usado en el intento',
      },
      successful: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        comment: 'Indica si el intento fue exitoso',
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: false,
        comment: 'Dirección IP desde donde se hizo el intento',
      },
      attempt_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Fecha y hora del intento',
      },
    },
    {
      sequelize,
      modelName: 'LoginAttempt',
      tableName: 'login_attempts',
      timestamps: false,
      indexes: [
        { fields: ['username'] },
        { fields: ['ip_address'] },
        { fields: ['attempt_date'] },
      ],
    }
  )

  return LoginAttempt
}
