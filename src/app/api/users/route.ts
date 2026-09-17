import { createApiHandler, PERMISSIONS } from "@/server/core"
import {
  CreateUserSchema,
  QueryUserSchema,
} from "@/server/modules/users/user.schema"
import { UserService } from "@/server/modules/users/user.service"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.USER_VIEW],
  querySchema: QueryUserSchema,
  handler: async ({ query }) => {
    return await UserService.list(query)
  },
})

export const POST = createApiHandler({
  permissions: [PERMISSIONS.USER_MANAGE],
  bodySchema: CreateUserSchema,
  handler: async ({ body, user }) => {
    return await UserService.create(body, user)
  },
})
