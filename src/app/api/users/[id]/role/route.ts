import { eq } from "drizzle-orm"
import { db, roles, users } from "@/db"
import {
  BadRequestError,
  createApiHandler,
  ForbiddenError,
  IdParamSchema,
  NotFoundError,
  PERMISSIONS,
} from "@/server/core"
import { UpdateUserRoleSchema } from "@/server/schemas/user.schema"
import {
  buildProjectsSubquery,
  formatUserRow,
  managers,
} from "../../user.helper"

export const PATCH = createApiHandler({
  permissions: [PERMISSIONS.USER_UPDATE],
  paramsSchema: IdParamSchema,
  bodySchema: UpdateUserRoleSchema,
  handler: async ({ params, body, user }) => {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, params.id))

    if (!existing) {
      throw new NotFoundError("Không tìm thấy người dùng")
    }

    if (body.systemRole !== undefined) {
      if (!user || user.systemRole !== "SUPER_ADMIN") {
        throw new ForbiddenError(
          "Chỉ Quản trị viên cấp cao (SUPER_ADMIN) mới có quyền thay đổi vai trò hệ thống",
        )
      }

      if (user && params.id === user.id && body.systemRole !== "SUPER_ADMIN") {
        throw new BadRequestError(
          "Không thể tự hạ cấp vai trò của chính tài khoản đang đăng nhập",
        )
      }
    }

    await db
      .update(users)
      .set({
        ...(body.systemRole !== undefined && { systemRole: body.systemRole }),
        ...(body.roleId !== undefined && { roleId: body.roleId }),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, params.id))

    const [updatedRow] = await db
      .select({
        user: users,
        role: roles,
        manager: managers,
        projects: buildProjectsSubquery(),
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .leftJoin(managers, eq(users.managerPerNumber, managers.perNumber))
      .where(eq(users.id, params.id))

    return {
      data: updatedRow ? formatUserRow(updatedRow) : null,
      message: "Cập nhật quyền thành công",
    }
  },
})
