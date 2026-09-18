import { eq } from "drizzle-orm"
import { db, roles, users } from "@/db"
import {
  BadRequestError,
  ConflictError,
  createApiHandler,
  IdParamSchema,
  NotFoundError,
  PERMISSIONS,
} from "@/server/core"
import { UpdateUserSchema } from "@/server/schemas/user.schema"
import {
  buildProjectsSubquery,
  formatUserRow,
  managers,
} from "../user.helper"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.USER_VIEW],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    const [row] = await db
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

    if (!row) {
      throw new NotFoundError("Không tìm thấy người dùng")
    }

    return formatUserRow(row)
  },
})

export const PATCH = createApiHandler({
  permissions: [PERMISSIONS.USER_UPDATE],
  paramsSchema: IdParamSchema,
  bodySchema: UpdateUserSchema,
  handler: async ({ params, body }) => {
    const [existing] = await db
      .select({
        id: users.id,
        email: users.email,
        perNumber: users.perNumber,
        phone: users.phone,
      })
      .from(users)
      .where(eq(users.id, params.id))

    if (!existing) {
      throw new NotFoundError("Không tìm thấy người dùng")
    }

    if (body.email && body.email.trim() !== existing.email) {
      const [emailConflict] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, body.email.trim()))
        .limit(1)
      if (emailConflict && emailConflict.id !== params.id) {
        throw new ConflictError("Email đã được đăng ký trong hệ thống")
      }
    }

    if (body.perNumber && body.perNumber.trim() !== existing.perNumber) {
      const [perConflict] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.perNumber, body.perNumber.trim()))
        .limit(1)
      if (perConflict && perConflict.id !== params.id) {
        throw new ConflictError("Mã nhân viên (perNumber) đã tồn tại")
      }
    }

    await db
      .update(users)
      .set({
        ...body,
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
      message: "Cập nhật người dùng thành công",
    }
  },
})

export const DELETE = createApiHandler({
  permissions: [PERMISSIONS.USER_DELETE],
  paramsSchema: IdParamSchema,
  handler: async ({ params, user }) => {
    if (user && params.id === user.id) {
      throw new BadRequestError("Không thể tự xóa tài khoản của chính mình")
    }

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, params.id))

    if (!existing) {
      throw new NotFoundError("Không tìm thấy người dùng")
    }

    await db.delete(users).where(eq(users.id, params.id))

    return {
      data: { message: "Xóa người dùng thành công" },
      message: "Xóa người dùng thành công",
    }
  },
})
