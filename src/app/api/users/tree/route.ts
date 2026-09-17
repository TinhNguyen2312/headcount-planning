import { createApiHandler, PERMISSIONS } from "@/server/core"
import { QueryUserTreeSchema } from "@/server/modules/users/user.schema"
import { UserService } from "@/server/modules/users/user.service"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.USER_VIEW],
  querySchema: QueryUserTreeSchema,
  handler: async ({ query }) => {
    return await UserService.getTree(query)
  },
})
