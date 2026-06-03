const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Company extends Model {}

  Company.init(
    {
      id_company: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      tax_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      address: {
        type: DataTypes.STRING(200),
      },
      phone: {
        type: DataTypes.STRING(20),
      },
      email: {
        type: DataTypes.STRING(100),
        validate: {
          isEmail: true,
        },
      },
      logo_url: {
        type: DataTypes.BLOB('long'),
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      registration_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      expiration_date: {
        type: DataTypes.DATE,
      },
      plan: {
        type: DataTypes.ENUM('basic', 'premium', 'enterprise'),
        allowNull: false,
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
