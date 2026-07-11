// Modelo de Tarifa: define los precios por tipo de vehículo y modo de cobro
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Rate extends Model {}

  Rate.init(
    {
      id_rate: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Identificador único de la tarifa',
      },
      id_company: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Empresa a la que pertenece la tarifa',
      },
      vehicle_type: {
        type: DataTypes.ENUM('carro', 'moto', 'bicicleta'),
        allowNull: false,
        comment: 'Tipo de vehículo al que aplica esta tarifa',
      },
      hourly_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Valor por hora (o fracción)',
      },
      minute_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Valor por minuto',
      },
      full_day_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Valor por día completo',
      },
      effective_from: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Fecha desde la cual la tarifa está vigente',
      },
      effective_until: {
        type: DataTypes.DATE,
        comment: 'Fecha hasta la cual la tarifa está vigente (null = vigente)',
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si la tarifa está activa',
      },
      billing_mode: {
        type: DataTypes.ENUM('minuto', 'hora', 'dia', 'mixto'),
        allowNull: false,
        defaultValue: 'mixto',
        comment: 'Modo de cobro: minuto, hora, día o mixto',
      },
      minutes_to_hours_threshold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Minutos a partir de los cuales se cobra como hora (0 = sin umbral)',
      },
      hours_to_days_threshold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Horas a partir de las cuales se cobra como día (0 = sin umbral)',
      },
      hourly_rounding: {
        type: DataTypes.ENUM('arriba', 'exacto'),
        allowNull: false,
        defaultValue: 'arriba',
        comment: 'Redondeo de horas: arriba (redondear hacia arriba) o exacto',
      },
      daily_rounding: {
        type: DataTypes.ENUM('arriba', 'exacto'),
        allowNull: false,
        defaultValue: 'arriba',
        comment: 'Redondeo de días: arriba (redondear hacia arriba) o exacto',
      },
    },
    {
      sequelize,
      modelName: 'Rate',
      tableName: 'rates',
      timestamps: false,
    }
  )

  return Rate
}
