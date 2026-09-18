import { createApiHandler, PERMISSIONS } from "@/server/core"
import {
  CreateRoleSchema,
  QueryRoleSchema,
} from "@/server/modules/roles/role.schema"
import { RoleService } from "@/server/modules/roles/role.service"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.ROLE_VIEW],
  querySchema: QueryRoleSchema,
  handler: async ({ query }) => {
    return await RoleService.list(query)
  },
})

export const POST = createApiHandler({
  permissions: [PERMISSIONS.ROLE_CREATE],
  bodySchema: CreateRoleSchema,
  handler: async ({ body }) => {
    return await RoleService.create(body)
  },
})
