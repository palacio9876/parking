// DTOs de movimiento: esquemas de validación para registrar entrada y salida de vehículos
const { z } = require('zod')

const createMovementDto = z.object({
  license_plate: z.string().trim().min(1, 'license_plate is required'),
  type: z.enum(['car', 'motorcycle', 'bicycle']),
})

const recordExitDto = z.object({
  license_plate: z.string().trim().min(1, 'license_plate is required'),
})

module.exports = {
  createMovementDto,
  recordExitDto,
}
