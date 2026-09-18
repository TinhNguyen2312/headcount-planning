import { eq, sql } from "drizzle-orm"
import { db, departments, roles, userProjects, users } from "@/db"
import {
  BadRequestError,
  ConflictError,
  createApiHandler,
  IdParamSchema,
  NotFoundError,
  PERMISSIONS,
} from "@/server/core"
import { UpdateRoleSchema } from "@/server/schemas/role.schema"

const formatRoleRow = (row: any) => ({
  role: {
    ...row.role,
    department: row.department,
  },
})

export const GET = createApiHandler({
  permissions: [PERMISSIONS.ROLE_VIEW],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    const [row] = await db
      .select({
        role: roles,
        department: departments,
      })
      .from(roles)
      .leftJoin(departments, eq(roles.departmentId, departments.id))
      .where(eq(roles.id, params.id))

    if (!row) {
      throw new NotFoundError("Không tìm thấy chức danh")
    }

    return formatRoleRow(row)
  },
})

export const PATCH = createApiHandler({
  permissions: [PERMISSIONS.ROLE_UPDATE],
  paramsSchema: IdParamSchema,
  bodySchema: UpdateRoleSchema,
  handler: async ({ params, body }) => {
    const [existing] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, params.id))

    if (!existing) {
      throw new NotFoundError("Không tìm thấy chức danh")
    }

    if (body.code && body.code !== existing.code) {
      const [codeConflict] = await db
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.code, body.code))
        .limit(1)
      if (codeConflict) {
        throw new ConflictError("Mã chức danh đã tồn tại")
      }
    }

    if (body.departmentId !== undefined && body.departmentId !== null) {
      const [dept] = await db
        .select({ id: departments.id })
        .from(departments)
        .where(eq(departments.id, body.departmentId))
        .limit(1)
      if (!dept) {
        throw new BadRequestError("Phòng ban không tồn tại")
      }
    }

    if (body.parentRoleId !== undefined && body.parentRoleId !== null) {
      if (body.parentRoleId === params.id) {
        throw new BadRequestError("Chức danh không thể là cha của chính nó")
      }

      const [parent] = await db
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.id, body.parentRoleId))
        .limit(1)
      if (!parent) {
        throw new BadRequestError("Chức danh cha không tồn tại")
      }

      const ancestorQuery = sql`
        WITH RECURSIVE role_ancestors AS (
          SELECT id, parent_role_id FROM roles WHERE id = ${body.parentRoleId}
          UNION
          SELECT r.id, r.parent_role_id FROM roles r
          INNER JOIN role_ancestors ra ON r.id = ra.parent_role_id
        )
        SELECT id FROM role_ancestors WHERE id = ${params.id}
      `
      const cycleResult = await db.execute<{ id: number }>(ancestorQuery)
      if (cycleResult.length > 0) {
        throw new BadRequestError(
          "Kế thừa không hợp lệ: Sẽ gây ra chu trình lặp vô tận giữa các chức danh",
        )
      }
    }

    const [updated] = await db
      .update(roles)
      .set(body)
      .where(eq(roles.id, params.id))
      .returning()

    return {
      data: updated,
      message: "Cập nhật chức danh thành công",
    }
  },
})

export const DELETE = createApiHandler({
  permissions: [PERMISSIONS.ROLE_DELETE],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    const [existing] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.id, params.id))

    if (!existing) {
      throw new NotFoundError("Không tìm thấy chức danh")
    }

    const [child] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.parentRoleId, params.id))
      .limit(1)
    if (child) {
      throw new BadRequestError(
        "Không thể xóa chức danh đang có chức danh cấp dưới",
      )
    }

    const [assignedUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.roleId, params.id))
      .limit(1)
    if (assignedUser) {
      throw new BadRequestError(
        "Không thể xóa chức danh đang được gán cho nhân sự",
      )
    }

    const [assignedProject] = await db
      .select({ id: userProjects.id })
      .from(userProjects)
      .where(eq(userProjects.roleId, params.id))
      .limit(1)
    if (assignedProject) {
      throw new BadRequestError(
        "Không thể xóa chức danh đang được phân bổ trong dự án",
      )
    }

    await db.delete(roles).where(eq(roles.id, params.id))

    return {
      data: { message: "Xóa chức danh thành công" },
      message: "Xóa chức danh thành công",
    }
  },
})
