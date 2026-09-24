import { eq, inArray } from "drizzle-orm"
import { accessRoles, db, userAccessRoles, users } from "@/db"
import {
  BadRequestError,
  createApiHandler,
  IdParamSchema,
  NotFoundError,
  PERMISSIONS,
} from "@/server/core"
import { AssignUserAccessRolesSchema } from "@/server/schemas"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.USER_VIEW],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    const userId = params.id

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) {
      throw new NotFoundError("Không tìm thấy người dùng")
    }

    const assignedRoles = await db
      .select({
        role: accessRoles,
        grantedAt: userAccessRoles.grantedAt,
      })
      .from(userAccessRoles)
      .innerJoin(
        accessRoles,
        eq(userAccessRoles.accessRoleId, accessRoles.id),
      )
      .where(eq(userAccessRoles.userId, userId))

    return {
      data: assignedRoles.map((r) => ({
        ...r.role,
        grantedAt: r.grantedAt,
      })),
      message: "Thành công",
    }
  },
})

export const PUT = createApiHandler({
  permissions: [PERMISSIONS.ACCESS_ROLE_ASSIGN],
  paramsSchema: IdParamSchema,
  bodySchema: AssignUserAccessRolesSchema,
  handler: async ({ params, body, user }) => {
    const userId = params.id

    const [targetUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!targetUser) {
      throw new NotFoundError("Không tìm thấy người dùng")
    }

    const uniqueRoleIds = Array.from(new Set(body.accessRoleIds))

    if (uniqueRoleIds.length > 0) {
      const validRoles = await db
        .select({
          id: accessRoles.id,
          scope: accessRoles.scope,
        })
        .from(accessRoles)
        .where(inArray(accessRoles.id, uniqueRoleIds))

      if (validRoles.length !== uniqueRoleIds.length) {
        throw new BadRequestError("Một hoặc nhiều vai trò truy cập không tồn tại")
      }

      const invalidScopeRole = validRoles.find((r) => r.scope !== "GLOBAL")
      if (invalidScopeRole) {
        throw new BadRequestError(
          "Chỉ có thể gán các vai trò có phạm vi Toàn cục (GLOBAL) cho người dùng",
        )
      }
    }

    // Đồng bộ user_access_roles
    await db
      .delete(userAccessRoles)
      .where(eq(userAccessRoles.userId, userId))

    if (uniqueRoleIds.length > 0) {
      await db.insert(userAccessRoles).values(
        uniqueRoleIds.map((roleId) => ({
          userId,
          accessRoleId: roleId,
          grantedBy: user?.id ?? null,
        })),
      )
    }

    return {
      message: "Cập nhật vai trò người dùng thành công",
    }
  },
})
