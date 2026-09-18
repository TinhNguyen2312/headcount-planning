import { eq } from "drizzle-orm"
import { db, roles, users } from "@/db"
import {
  BadRequestError,
  createApiHandler,
  IdParamSchema,
  NotFoundError,
  PERMISSIONS,
} from "@/server/core"
import {
  buildProjectsSubquery,
  formatUserRow,
  managers,
} from "../../user.helper"

export const PATCH = createApiHandler({
  permissions: [PERMISSIONS.USER_BLOCK],
  paramsSchema: IdParamSchema,
  handler: async ({ params, user }) => {
    if (user && params.id === user.id) {
      throw new BadRequestError("Không thể tự khóa tài khoản của chính mình")
    }

    const [existing] = await db
      .select({ id: users.id, status: users.status })
      .from(users)
      .where(eq(users.id, params.id))

    if (!existing) {
      throw new NotFoundError("Không tìm thấy người dùng")
    }

    const newStatus = existing.status === "LOCKED" ? "ACTIVE" : "LOCKED"

    await db
      .update(users)
      .set({
        status: newStatus,
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
      message: `${newStatus === "LOCKED" ? "Khóa" : "Mở khóa"} tài khoản thành công`,
    }
  },
})

export const POST = PATCH
