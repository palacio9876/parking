// Modelo de Empresa: datos principales de cada compañía cliente del sistema
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Company extends Model {}

  Company.init(
    {
      id_company: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Identificador único de la empresa',
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nombre comercial de la empresa',
      },
      tax_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'NIT / Identificación tributaria de la empresa',
      },
      address: {
        type: DataTypes.STRING(200),
        comment: 'Dirección física de la empresa',
      },
      phone: {
        type: DataTypes.STRING(20),
        comment: 'Teléfono de contacto',
      },
      email: {
        type: DataTypes.STRING(100),
        validate: {
          isEmail: true,
        },
        comment: 'Correo electrónico de contacto',
      },
      logo_url: {
        type: DataTypes.BLOB('long'),
        comment: 'Logo de la empresa en formato binario (BLOB)',
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si la empresa está activa en el sistema',
      },
      registration_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Fecha de registro de la empresa',
      },
      expiration_date: {
        type: DataTypes.DATE,
        comment: 'Fecha de expiración del plan/suscripción',
      },
      plan: {
        type: DataTypes.ENUM('basico', 'premium', 'empresarial'),
        allowNull: false,
        comment: 'Plan de suscripción: básico, premium o empresarial',
      },
    },
    {
      sequelize,
      modelName: 'Company',
      tableName: 'companies',
      timestamps: false,
    }
  )

  return Company
}
