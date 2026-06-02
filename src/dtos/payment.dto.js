const { z } = require('zod')

const createPaymentDto = z.object({
  id_movement: z.coerce.number().int().positive(),
  payments: z.array(
    z.object({
      payment_method: z.enum(['cash', 'card', 'QR']),
      amount: z.coerce.number().positive(),
    })
  ).min(1),
})

module.exports = {
  createPaymentDto,
}
