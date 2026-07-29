'use strict'

const bcrypt = require('bcryptjs')

module.exports = {
  async up(queryInterface, Sequelize) {
    const hash = await bcrypt.hash('admin123', 10)

    await queryInterface.bulkInsert('companies', [{
      id_company: 1,
      name: 'Central Parking',
      tax_id: '900123456-7',
      address: 'Main Street #123',
      phone: '3001234567',
      email: 'info@centralparking.com',
      active: true,
      registration_date: new Date(),
      plan: 'premium',
    }])

    await queryInterface.bulkInsert('company_settings', [{
      id_company: 1,
      car_total_capacity: 100,
      motorcycle_total_capacity: 50,
      bicycle_total_capacity: 30,
      opening_time: '06:00:00',
      closing_time: '22:00:00',
      vat_percentage: 19.00,
      currency: 'COP',
      timezone: 'America/Bogota',
      operation_24h: false,
    }])

    await queryInterface.bulkInsert('users', [{
      id_company: 1,
      name: 'Administrator',
      username: 'admin',
      password: hash,
      role: 'admin',
      active: true,
      creation_date: new Date(),
    }])

    await queryInterface.bulkInsert('rates', [
      {
        id_company: 1,
        vehicle_type: 'carro',
        hourly_rate: 6000.00,
        minute_rate: 120.00,
        full_day_rate: 30000.00,
        effective_from: new Date(),
        active: true,
        billing_mode: 'mixto',
        minutes_to_hours_threshold: 30,
        hours_to_days_threshold: 5,
        hourly_rounding: 'arriba',
        daily_rounding: 'arriba',
      },
      {
        id_company: 1,
        vehicle_type: 'moto',
        hourly_rate: 3000.00,
        minute_rate: 60.00,
        full_day_rate: 15000.00,
        effective_from: new Date(),
        active: true,
        billing_mode: 'mixto',
        minutes_to_hours_threshold: 30,
        hours_to_days_threshold: 5,
        hourly_rounding: 'arriba',
        daily_rounding: 'arriba',
      },
      {
        id_company: 1,
        vehicle_type: 'bicicleta',
        hourly_rate: 1500.00,
        minute_rate: 30.00,
        full_day_rate: 8000.00,
        effective_from: new Date(),
        active: true,
        billing_mode: 'mixto',
        minutes_to_hours_threshold: 30,
        hours_to_days_threshold: 5,
        hourly_rounding: 'arriba',
        daily_rounding: 'arriba',
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('rates', null, {})
    await queryInterface.bulkDelete('users', null, {})
    await queryInterface.bulkDelete('company_settings', null, {})
    await queryInterface.bulkDelete('companies', null, {})
  },
}
