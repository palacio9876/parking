// Modelo de Configuración de Empresa: capacidades, horarios e impuestos
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class CompanySetting extends Model {}

  CompanySetting.init(
    {
      id_setting: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Identificador único de la configuración',
      },
      id_company: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Empresa a la que pertenece esta configuración',
      },
      car_total_capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50,
        comment: 'Capacidad total de carros en el parqueadero',
      },
      motorcycle_total_capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
        comment: 'Capacidad total de motos en el parqueadero',
      },
      bicycle_total_capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 20,
        comment: 'Capacidad total de bicicletas en el parqueadero',
      },
      opening_time: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: '06:00:00',
        comment: 'Hora de apertura del parqueadero',
      },
      closing_time: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: '22:00:00',
        comment: 'Hora de cierre del parqueadero',
      },
      vat_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 19.0,
        comment: 'Porcentaje de IVA aplicado a los servicios',
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'COP',
        comment: 'Moneda utilizada (ej. COP, USD)',
      },
      timezone: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'America/Bogota',
        comment: 'Zona horaria del parqueadero',
      },
      operation_24h: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si el parqueadero opera 24 horas',
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
