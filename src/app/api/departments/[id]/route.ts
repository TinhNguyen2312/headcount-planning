import { eq, sql } from "drizzle-orm"
import { db, departments, propertyDepartments, roles } from "@/db"
import {
  BadRequestError,
  ConflictError,
  createApiHandler,
  IdParamSchema,
  NotFoundError,
  PERMISSIONS,
} from "@/server/core"
import { UpdateDepartmentSchema } from "@/server/schemas/department.schema"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.DEPARTMENT_VIEW],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    const [dept] = await db
      .select()
      .from(departments)
      .where(eq(departments.id, params.id))

    if (!dept) {
      throw new NotFoundError("Không tìm thấy phòng ban")
    }

    return dept
  },
})

export const PATCH = createApiHandler({
  permissions: [PERMISSIONS.DEPARTMENT_UPDATE],
  paramsSchema: IdParamSchema,
  bodySchema: UpdateDepartmentSchema,
  handler: async ({ params, body }) => {
    const [existing] = await db
      .select()
      .from(departments)
      .where(eq(departments.id, params.id))

    if (!existing) {
      throw new NotFoundError("Không tìm thấy phòng ban")
    }

    if (body.code && body.code !== existing.code) {
      const [codeConflict] = await db
        .select({ id: departments.id })
        .from(departments)
        .where(eq(departments.code, body.code))
        .limit(1)

      if (codeConflict) {
        throw new ConflictError("Mã phòng ban đã tồn tại")
      }
    }

    if (body.parentId !== undefined && body.parentId !== null) {
      if (body.parentId === params.id) {
        throw new BadRequestError("Phòng ban không thể là cha của chính nó")
      }

      const [parent] = await db
        .select({ id: departments.id })
        .from(departments)
        .where(eq(departments.id, body.parentId))
        .limit(1)

      if (!parent) {
        throw new BadRequestError("Phòng ban cha không tồn tại")
      }

      const ancestorQuery = sql`
        WITH RECURSIVE dept_ancestors AS (
          SELECT id, parent_id FROM departments WHERE id = ${body.parentId}
          UNION
          SELECT d.id, d.parent_id FROM departments d
          INNER JOIN dept_ancestors da ON d.id = da.parent_id
        )
        SELECT id FROM dept_ancestors WHERE id = ${params.id}
      `
      const cycleResult = await db.execute<{ id: number }>(ancestorQuery)
      if (cycleResult.length > 0) {
        throw new BadRequestError(
          "Kế thừa không hợp lệ: Sẽ gây ra chu trình lặp vô tận giữa các phòng ban",
        )
      }
    }

    const [updated] = await db
      .update(departments)
      .set({
        ...body,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(departments.id, params.id))
      .returning()

    return {
      data: updated,
      message: "Cập nhật phòng ban thành công",
    }
  },
})

export const DELETE = createApiHandler({
  permissions: [PERMISSIONS.DEPARTMENT_DELETE],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    const [existing] = await db
      .select()
      .from(departments)
      .where(eq(departments.id, params.id))

    if (!existing) {
      throw new NotFoundError("Không tìm thấy phòng ban")
    }

    const [hasChildren] = await db
      .select({ id: departments.id })
      .from(departments)
      .where(eq(departments.parentId, params.id))
      .limit(1)

    if (hasChildren) {
      throw new BadRequestError(
        "Không thể xóa phòng ban đang có đơn vị trực thuộc",
      )
    }

    const [hasRoles] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.departmentId, params.id))
      .limit(1)

    if (hasRoles) {
      throw new BadRequestError(
        "Không thể xóa phòng ban đang có chức danh gán vào",
      )
    }

    const [hasProperties] = await db
      .select({ id: propertyDepartments.id })
      .from(propertyDepartments)
      .where(eq(propertyDepartments.departmentId, params.id))
      .limit(1)

    if (hasProperties) {
      throw new BadRequestError(
        "Không thể xóa phòng ban đang liên kết với thuộc tính dự án",
      )
    }

    await db.delete(departments).where(eq(departments.id, params.id))

    return {
      data: { message: "Xóa phòng ban thành công" },
      message: "Xóa phòng ban thành công",
    }
  },
})
