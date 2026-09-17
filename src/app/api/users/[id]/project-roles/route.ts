import { createApiHandler, IdParamSchema, PERMISSIONS } from "@/server/core"
import { AssignProjectRoleSchema } from "@/server/modules/users/user.schema"
import { UserService } from "@/server/modules/users/user.service"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.USER_VIEW],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    return await UserService.getProjectRoles(params.id)
  },
})

export const POST = createApiHandler({
  permissions: [PERMISSIONS.PROJECT_ASSIGNMENT_MANAGE],
  paramsSchema: IdParamSchema,
  bodySchema: AssignProjectRoleSchema,
  handler: async ({ params, body }) => {
    return await UserService.assignProjectRole(params.id, body)
  },
})
