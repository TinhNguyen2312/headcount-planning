import { createApiHandler, IdParamSchema, PERMISSIONS } from "@/server/core"
import { UpdateUserProjectRoleSchema } from "@/server/modules/user-project-roles/user-project-role.schema"
import { UserProjectRoleService } from "@/server/modules/user-project-roles/user-project-role.service"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.PROJECT_VIEW],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    return await UserProjectRoleService.getById(params.id)
  },
})

export const PATCH = createApiHandler({
  permissions: [PERMISSIONS.PROJECT_ASSIGNMENT_MANAGE],
  paramsSchema: IdParamSchema,
  bodySchema: UpdateUserProjectRoleSchema,
  handler: async ({ params, body }) => {
    return await UserProjectRoleService.update(params.id, body)
  },
})

export const PUT = PATCH

export const DELETE = createApiHandler({
  permissions: [PERMISSIONS.PROJECT_ASSIGNMENT_MANAGE],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    return await UserProjectRoleService.delete(params.id)
  },
})
