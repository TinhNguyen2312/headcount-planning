import { createApiHandler, IdParamSchema, PERMISSIONS } from "@/server/core"
import { SaveProjectPropertiesSchema } from "@/server/modules/projects/project.schema"
import { ProjectService } from "@/server/modules/projects/project.service"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.PROJECT_VIEW],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    return await ProjectService.getProperties(params.id)
  },
})

export const PUT = createApiHandler({
  permissions: [PERMISSIONS.PROJECT_UPDATE],
  paramsSchema: IdParamSchema,
  bodySchema: SaveProjectPropertiesSchema,
  handler: async ({ params, body }) => {
    return await ProjectService.saveProperties(params.id, body)
  },
})
