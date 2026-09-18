import { createApiHandler, PERMISSIONS } from "@/server/core"
import {
  CreateSectorSchema,
  QuerySectorSchema,
} from "@/server/modules/sectors/sector.schema"
import { SectorService } from "@/server/modules/sectors/sector.service"

export const GET = createApiHandler({
  querySchema: QuerySectorSchema,
  handler: async ({ query }) => {
    return await SectorService.list(query)
  },
})

export const POST = createApiHandler({
  permissions: [PERMISSIONS.CATALOG_MANAGE],
  bodySchema: CreateSectorSchema,
  handler: async ({ body }) => {
    return await SectorService.create(body)
  },
})
