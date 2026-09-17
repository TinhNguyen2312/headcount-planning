import { createApiHandler, IdParamSchema, PERMISSIONS } from "@/server/core"
import { UpdateProjectSchema } from "@/server/modules/projects/project.schema"
import { ProjectService } from "@/server/modules/projects/project.service"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.PROJECT_VIEW],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    return await ProjectService.getById(params.id)
  },
})

export const PATCH = createApiHandler({
  permissions: [PERMISSIONS.PROJECT_UPDATE],
  paramsSchema: IdParamSchema,
  bodySchema: UpdateProjectSchema,
  handler: async ({ params, body }) => {
    return await ProjectService.update(params.id, body)
  },
})

export const PUT = PATCH

export const DELETE = createApiHandler({
  permissions: [PERMISSIONS.PROJECT_DELETE],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    return await ProjectService.delete(params.id)
  },
})
