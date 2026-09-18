import { createApiHandler, PERMISSIONS } from "@/server/core"
import {
  CreateRegionSchema,
  QueryRegionSchema,
} from "@/server/modules/regions/region.schema"
import { RegionService } from "@/server/modules/regions/region.service"

export const GET = createApiHandler({
  querySchema: QueryRegionSchema,
  handler: async ({ query }) => {
    return await RegionService.list(query)
  },
})

export const POST = createApiHandler({
  permissions: [PERMISSIONS.CATALOG_MANAGE],
  bodySchema: CreateRegionSchema,
  handler: async ({ body }) => {
    return await RegionService.create(body)
  },
})
