import { createApiHandler, PERMISSIONS } from "@/server/core"
import { CreateLocalUserSchema } from "@/server/modules/users/user.schema"
import { UserService } from "@/server/modules/users/user.service"

export const POST = createApiHandler({
  permissions: [PERMISSIONS.USER_MANAGE],
  bodySchema: CreateLocalUserSchema,
  handler: async ({ body, user }) => {
    return await UserService.createLocal(body, user)
  },
})
