const { z } = require('zod')

const queryStatsDto = z.object({
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(5),
  page: z.coerce.number().int().min(0).optional().default(0),
})

module.exports = {
  queryStatsDto,
}
