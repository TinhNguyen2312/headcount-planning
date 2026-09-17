import { createApiHandler, IdParamSchema, PERMISSIONS } from "@/server/core"
import { UserService } from "@/server/modules/users/user.service"

export const PATCH = createApiHandler({
  permissions: [PERMISSIONS.USER_MANAGE],
  paramsSchema: IdParamSchema,
  handler: async ({ params, user }) => {
    return await UserService.toggleBlock(params.id, user!)
  },
})

export const POST = PATCH
