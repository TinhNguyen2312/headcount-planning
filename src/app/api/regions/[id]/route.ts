import { createApiHandler, IdParamSchema, PERMISSIONS } from "@/server/core"
import { UpdateRegionSchema } from "@/server/modules/regions/region.schema"
import { RegionService } from "@/server/modules/regions/region.service"

export const GET = createApiHandler({
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    return await RegionService.getById(params.id)
  },
})

export const PATCH = createApiHandler({
  permissions: [PERMISSIONS.CATALOG_MANAGE],
  paramsSchema: IdParamSchema,
  bodySchema: UpdateRegionSchema,
  handler: async ({ params, body }) => {
    return await RegionService.update(params.id, body)
  },
})

export const DELETE = createApiHandler({
  permissions: [PERMISSIONS.CATALOG_MANAGE],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    return await RegionService.delete(params.id)
  },
})
