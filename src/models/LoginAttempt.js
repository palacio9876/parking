const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class LoginAttempt extends Model {}

  LoginAttempt.init(
    {
      id_attempt: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_company: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      successful: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      attempt_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
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
