// DTO de tarifa: esquema de validación para crear o actualizar tarifas
const { z } = require('zod')

const createRateDto = z.object({
  vehicle_type: z.enum(['car', 'motorcycle', 'bicycle']),
  hourly_rate: z.coerce.number().positive('hourly_rate must be > 0'),
  minute_rate: z.coerce.number().positive('minute_rate must be > 0'),
  full_day_rate: z.coerce.number().positive('full_day_rate must be > 0'),
  billing_mode: z.enum(['minute', 'hour', 'day', 'mixed']).optional().default('mixed'),
  minutes_to_hours_threshold: z.coerce.number().int().min(0).optional().default(0),
  hours_to_days_threshold: z.coerce.number().int().min(0).optional().default(0),
  hourly_rounding: z.enum(['up', 'exact']).optional().default('up'),
  daily_rounding: z.enum(['up', 'exact']).optional().default('up'),
})

module.exports = {
  createRateDto,
}
