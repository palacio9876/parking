// DTOs de empresa: esquemas de validación para actualizar datos y configuraciones
const { z } = require('zod')

const updateCompanyDto = z.object({
  name: z.string().trim().min(1, 'name is required').optional(),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().email('invalid email').optional(),
})

const updateSettingsDto = z.object({
  car_total_capacity: z.coerce.number().int().min(1).optional(),
  motorcycle_total_capacity: z.coerce.number().int().min(1).optional(),
  bicycle_total_capacity: z.coerce.number().int().min(1).optional(),
  opening_time: z.string().time().optional(),
  closing_time: z.string().time().optional(),
  vat_percentage: z.coerce.number().min(0).max(100).optional(),
  currency: z.string().trim().max(10).optional(),
  timezone: z.string().trim().optional(),
  operation_24h: z.boolean().optional(),
})

module.exports = {
  updateCompanyDto,
  updateSettingsDto,
}
