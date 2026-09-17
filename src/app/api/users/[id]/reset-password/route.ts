import { createApiHandler, IdParamSchema, PERMISSIONS } from "@/server/core"
import { ResetPasswordSchema } from "@/server/modules/users/user.schema"
import { UserService } from "@/server/modules/users/user.service"

export const POST = createApiHandler({
  permissions: [PERMISSIONS.USER_MANAGE],
  paramsSchema: IdParamSchema,
  bodySchema: ResetPasswordSchema,
  handler: async ({ params, body, user }) => {
    return await UserService.resetPassword(params.id, body, user!)
  },
})
