const { z } = require('zod')

const loginDto = z.object({
  tax_id:   z.string().trim().min(3, 'tax_id is required'),
  username: z.string().trim().min(1, 'username is required'),
  password: z.string().min(1, 'password is required'),
})

module.exports = { loginDto }