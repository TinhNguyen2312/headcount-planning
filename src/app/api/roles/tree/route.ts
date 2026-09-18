import { createApiHandler, PERMISSIONS } from "@/server/core"
import { QueryRoleTreeSchema } from "@/server/modules/roles/role.schema"
import { RoleService } from "@/server/modules/roles/role.service"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.ROLE_VIEW],
  querySchema: QueryRoleTreeSchema,
  handler: async ({ query }) => {
    return await RoleService.getTree(query)
  },
})
