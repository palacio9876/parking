// Punto central de modelos Sequelize: inicializa todos los modelos y define sus asociaciones
const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Company = require('./Company')(sequelize, DataTypes)
const User = require('./User')(sequelize, DataTypes)
const LoginAttempt = require('./LoginAttempt')(sequelize, DataTypes)
const CompanySetting = require('./CompanySetting')(sequelize, DataTypes)
const Vehicle = require('./Vehicle')(sequelize, DataTypes)
const Rate = require('./Rate')(sequelize, DataTypes)
const Movement = require('./Movement')(sequelize, DataTypes)
const Payment = require('./Payment')(sequelize, DataTypes)
const Shift = require('./Shift')(sequelize, DataTypes)

// Asociaciones entre modelos
// Una empresa tiene muchos usuarios, intentos de login, configuraciones, vehículos, tarifas, movimientos, pagos y turnos
Company.hasMany(User, { foreignKey: 'id_company', as: 'users' })
User.belongsTo(Company, { foreignKey: 'id_company', as: 'company' })

Company.hasMany(LoginAttempt, { foreignKey: 'id_company', as: 'loginAttempts' })
LoginAttempt.belongsTo(Company, { foreignKey: 'id_company', as: 'company' })

Company.hasOne(CompanySetting, { foreignKey: 'id_company', as: 'settings' })
CompanySetting.belongsTo(Company, { foreignKey: 'id_company', as: 'company' })

Company.hasMany(Vehicle, { foreignKey: 'id_company', as: 'vehicles' })
Vehicle.belongsTo(Company, { foreignKey: 'id_company', as: 'company' })

Company.hasMany(Rate, { foreignKey: 'id_company', as: 'rates' })
Rate.belongsTo(Company, { foreignKey: 'id_company', as: 'company' })

Company.hasMany(Movement, { foreignKey: 'id_company', as: 'movements' })
Movement.belongsTo(Company, { foreignKey: 'id_company', as: 'company' })

Company.hasMany(Payment, { foreignKey: 'id_company', as: 'payments' })
Payment.belongsTo(Company, { foreignKey: 'id_company', as: 'company' })

Company.hasMany(Shift, { foreignKey: 'id_company', as: 'shifts' })
Shift.belongsTo(Company, { foreignKey: 'id_company', as: 'company' })

// Un usuario puede registrar entradas y salidas de movimientos
User.hasMany(Movement, { foreignKey: 'id_user_entry', as: 'entryMovements' })
User.hasMany(Movement, { foreignKey: 'id_user_exit', as: 'exitMovements' })
Movement.belongsTo(User, { foreignKey: 'id_user_entry', as: 'entryUser' })
Movement.belongsTo(User, { foreignKey: 'id_user_exit', as: 'exitUser' })

// Un vehículo tiene muchos movimientos (entradas/salidas)
Vehicle.hasMany(Movement, { foreignKey: 'id_vehicle', as: 'movements' })
Movement.belongsTo(Vehicle, { foreignKey: 'id_vehicle', as: 'vehicle' })

// Una tarifa está asociada a muchos movimientos
Rate.hasMany(Movement, { foreignKey: 'id_rate', as: 'movements' })
Movement.belongsTo(Rate, { foreignKey: 'id_rate', as: 'rate' })

// Un movimiento puede tener varios pagos (split de métodos de pago)
Movement.hasMany(Payment, { foreignKey: 'id_movement', as: 'payments' })
Payment.belongsTo(Movement, { foreignKey: 'id_movement', as: 'movement' })

User.hasMany(Payment, { foreignKey: 'id_user', as: 'payments' })
Payment.belongsTo(User, { foreignKey: 'id_user', as: 'user' })

User.hasMany(Shift, { foreignKey: 'id_user', as: 'shifts' })
Shift.belongsTo(User, { foreignKey: 'id_user', as: 'user' })

module.exports = {
  sequelize,
  Company,
  User,
  LoginAttempt,
  CompanySetting,
  Vehicle,
  Rate,
  Movement,
  Payment,
  Shift,
}
