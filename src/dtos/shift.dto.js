// DTOs de turno: esquemas de validación para apertura y cierre de caja
const { z } = require('zod')

const openShiftDto = z.object({
  initial_base: z.coerce.number().min(0, 'initial_base must be >= 0'),
  opening_observation: z.string().trim().optional(),
})

const closeShiftDto = z.object({
  total_cash: z.coerce.number().optional(),
  total_card: z.coerce.number().optional(),
  total_qr: z.coerce.number().optional(),
  closing_observation: z.string().trim().optional(),
})

module.exports = {
  openShiftDto,
  closeShiftDto,
}
