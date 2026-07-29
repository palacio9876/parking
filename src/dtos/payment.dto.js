// DTO de pago: esquema de validación para registrar pagos de un movimiento
const { z } = require('zod')

const createPaymentDto = z.object({
  id_movement: z.coerce.number().int().positive(),
  payments: z.array(
    z.object({
      payment_method: z.enum(['efectivo', 'tarjeta', 'QR']),
      amount: z.coerce.number().positive(),
    })
  ).min(1),
})

module.exports = {
  createPaymentDto,
}
