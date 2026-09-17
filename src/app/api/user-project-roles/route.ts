import { createApiHandler, PERMISSIONS } from "@/server/core"
import {
  CreateUserProjectRoleSchema,
  QueryUserProjectRoleSchema,
} from "@/server/modules/user-project-roles/user-project-role.schema"
import { UserProjectRoleService } from "@/server/modules/user-project-roles/user-project-role.service"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.PROJECT_VIEW],
  querySchema: QueryUserProjectRoleSchema,
  handler: async ({ query }) => {
    return await UserProjectRoleService.list(query)
  },
})

export const POST = createApiHandler({
  permissions: [PERMISSIONS.PROJECT_ASSIGNMENT_MANAGE],
  bodySchema: CreateUserProjectRoleSchema,
  handler: async ({ body }) => {
    return await UserProjectRoleService.create(body)
  },
})
