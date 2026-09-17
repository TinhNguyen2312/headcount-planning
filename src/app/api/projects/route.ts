import { createApiHandler, PERMISSIONS } from "@/server/core"
import {
  CreateProjectSchema,
  QueryProjectSchema,
} from "@/server/modules/projects/project.schema"
import { ProjectService } from "@/server/modules/projects/project.service"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.PROJECT_VIEW],
  querySchema: QueryProjectSchema,
  handler: async ({ query }) => {
    return await ProjectService.list(query)
  },
})

export const POST = createApiHandler({
  permissions: [PERMISSIONS.PROJECT_CREATE],
  bodySchema: CreateProjectSchema,
  handler: async ({ body }) => {
    return await ProjectService.create(body)
  },
})
