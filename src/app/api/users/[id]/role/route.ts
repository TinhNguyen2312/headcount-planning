import { createApiHandler, IdParamSchema } from "@/server/core"
import { UpdateUserRoleSchema } from "@/server/modules/users/user.schema"
import { UserService } from "@/server/modules/users/user.service"

export const PATCH = createApiHandler({
  roles: ["SUPER_ADMIN"], // Bảo vệ tuyệt đối: Chỉ SUPER_ADMIN mới được đổi vai trò hệ thống
  paramsSchema: IdParamSchema,
  bodySchema: UpdateUserRoleSchema,
  handler: async ({ params, body, user }) => {
    return await UserService.updateRole(params.id, body, user!)
  },
})

export const PUT = PATCH
