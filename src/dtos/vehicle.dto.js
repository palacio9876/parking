// DTOs de vehículo: esquemas de validación para crear y actualizar vehículos
const { z } = require('zod')

const createVehicleDto = z.object({
  license_plate: z.string().trim().min(1, 'license_plate is required').max(10, 'license_plate must be max 10 characters'),
  type: z.enum(['carro', 'moto', 'bicicleta'], { message: 'type must be car, motorcycle, or bicycle' }),
  color: z.string().trim().min(1, 'color is required').max(30, 'color must be max 30 characters'),
  model: z.string().trim().optional(),
})

const updateVehicleDto = z.object({
  license_plate: z.string().trim().min(1, 'license_plate is required').max(10, 'license_plate must be max 10 characters').optional(),
  type: z.enum(['carro', 'moto', 'bicicleta'], { message: 'type must be car, motorcycle, or bicycle' }).optional(),
  color: z.string().trim().min(1, 'color is required').max(30, 'color must be max 30 characters').optional(),
  model: z.string().trim().optional(),
})

module.exports = {
  createVehicleDto,
  updateVehicleDto,
}
