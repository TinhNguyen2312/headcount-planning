import { createApiHandler, IdParamSchema, PERMISSIONS } from "@/server/core"
import { UpdateSectorSchema } from "@/server/modules/sectors/sector.schema"
import { SectorService } from "@/server/modules/sectors/sector.service"

export const GET = createApiHandler({
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    return await SectorService.getById(params.id)
  },
})

export const PATCH = createApiHandler({
  permissions: [PERMISSIONS.CATALOG_MANAGE],
  paramsSchema: IdParamSchema,
  bodySchema: UpdateSectorSchema,
  handler: async ({ params, body }) => {
    return await SectorService.update(params.id, body)
  },
})

export const DELETE = createApiHandler({
  permissions: [PERMISSIONS.CATALOG_MANAGE],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    return await SectorService.delete(params.id)
  },
})
