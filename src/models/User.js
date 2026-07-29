// Modelo de Usuario del Sistema: administradores y operadores del parqueadero
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class User extends Model {}

  User.init(
    {
      id_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Identificador único del usuario',
      },
      id_company: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Empresa a la que pertenece el usuario',
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nombre completo del usuario',
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Nombre de usuario para inicio de sesión',
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Hash de la contraseña (bcrypt)',
      },
      role: {
        type: DataTypes.ENUM('admin', 'operator'),
        allowNull: false,
        comment: 'Rol del usuario: admin (administrador) u operator (operador)',
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si el usuario está activo',
      },
      creation_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Fecha de creación del usuario',
      },
      last_access: {
        type: DataTypes.DATE,
        comment: 'Fecha del último inicio de sesión',
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['username', 'id_company'],
        },
      ],
    }
  )

  return User
}
