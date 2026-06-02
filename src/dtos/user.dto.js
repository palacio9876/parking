const { z } = require('zod')

const createUserDto = z.object({
  name: z.string().trim().min(1, 'name is required').max(100, 'name must be max 100 characters'),
  username: z.string().trim().min(1, 'username is required').max(50, 'username must be max 50 characters').regex(/^[A-Za-z0-9]+$/, 'username can only contain letters and numbers'),
  password: z.string().min(6, 'password must be at least 6 characters'),
  role: z.enum(['admin', 'operator'], { message: 'role must be admin or operator' }),
  active: z.boolean().optional().default(true),
})

const updateUserDto = z.object({
  name: z.string().trim().min(1, 'name is required').max(100, 'name must be max 100 characters').optional(),
  username: z.string().trim().min(1, 'username is required').max(50, 'username must be max 50 characters').regex(/^[A-Za-z0-9]+$/, 'username can only contain letters and numbers').optional(),
  password: z.string().min(6, 'password must be at least 6 characters').optional(),
  role: z.enum(['admin', 'operator'], { message: 'role must be admin or operator' }).optional(),
  active: z.boolean().optional(),
})

module.exports = {
  createUserDto,
  updateUserDto,
}
