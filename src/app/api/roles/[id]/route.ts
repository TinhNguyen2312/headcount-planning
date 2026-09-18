import { createApiHandler, IdParamSchema, PERMISSIONS } from "@/server/core"
import { UpdateRoleSchema } from "@/server/modules/roles/role.schema"
import { RoleService } from "@/server/modules/roles/role.service"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.ROLE_VIEW],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    return await RoleService.getById(params.id)
  },
})

export const PATCH = createApiHandler({
  permissions: [PERMISSIONS.ROLE_UPDATE],
  paramsSchema: IdParamSchema,
  bodySchema: UpdateRoleSchema,
  handler: async ({ params, body }) => {
    return await RoleService.update(params.id, body)
  },
})

export const DELETE = createApiHandler({
  permissions: [PERMISSIONS.ROLE_DELETE],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    return await RoleService.delete(params.id)
  },
})
