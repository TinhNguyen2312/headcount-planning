import { createApiHandler, IdParamSchema, PERMISSIONS } from "@/server/core"
import { UpdateUserSchema } from "@/server/modules/users/user.schema"
import { UserService } from "@/server/modules/users/user.service"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.USER_VIEW],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    return await UserService.getById(params.id)
  },
})

export const PATCH = createApiHandler({
  permissions: [PERMISSIONS.USER_MANAGE],
  paramsSchema: IdParamSchema,
  bodySchema: UpdateUserSchema,
  handler: async ({ params, body, user }) => {
    return await UserService.update(params.id, body, user)
  },
})

export const PUT = PATCH

export const DELETE = createApiHandler({
  permissions: [PERMISSIONS.USER_MANAGE],
  paramsSchema: IdParamSchema,
  handler: async ({ params, user }) => {
    return await UserService.delete(params.id, user!)
  },
})
