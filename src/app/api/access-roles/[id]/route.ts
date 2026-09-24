import { and, eq, inArray, ne, sql } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
import {
  accessRolePermissions,
  accessRoles,
  db,
  permissions,
  userAccessRoles,
  userProjects,
} from "@/db"
import {
  BadRequestError,
  ConflictError,
  createApiHandler,
  IdParamSchema,
  NotFoundError,
  PERMISSIONS,
} from "@/server/core"
import { UpdateAccessRoleSchema } from "@/server/schemas"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.ACCESS_ROLE_VIEW],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    const roleId = params.id
    const parentRoles = alias(accessRoles, "parent_roles")

    const [row] = await db
      .select({
        role: accessRoles,
        parentRole: parentRoles,
      })
      .from(accessRoles)
      .leftJoin(parentRoles, eq(accessRoles.parentId, parentRoles.id))
      .where(eq(accessRoles.id, roleId))
      .limit(1)

    if (!row) {
      throw new NotFoundError("Không tìm thấy vai trò truy cập")
    }

    const assignedPermissions = await db
      .select({
        permission: permissions,
      })
      .from(accessRolePermissions)
      .innerJoin(
        permissions,
        eq(accessRolePermissions.permissionId, permissions.id),
      )
      .where(eq(accessRolePermissions.accessRoleId, roleId))

    const permissionsList = assignedPermissions.map((p) => p.permission)

    return {
      data: {
        ...row.role,
        parentName: row.parentRole?.name ?? null,
        parent: row.parentRole ?? null,
        permissionIds: permissionsList.map((p) => p.id),
        permissions: permissionsList,
      },
      message: "Thành công",
    }
  },
})

export const PATCH = createApiHandler({
  permissions: [PERMISSIONS.ACCESS_ROLE_UPDATE],
  paramsSchema: IdParamSchema,
  bodySchema: UpdateAccessRoleSchema,
  handler: async ({ params, body }) => {
    const roleId = params.id

    const [existing] = await db
      .select()
      .from(accessRoles)
      .where(eq(accessRoles.id, roleId))
      .limit(1)

    if (!existing) {
      throw new NotFoundError("Không tìm thấy vai trò truy cập")
    }

    if (existing.isSystem) {
      if (body.name && body.name !== existing.name) {
        throw new BadRequestError(
          "Không thể thay đổi tên của vai trò hệ thống",
        )
      }
      if (body.scope && body.scope !== existing.scope) {
        throw new BadRequestError(
          "Không thể thay đổi phạm vi của vai trò hệ thống",
        )
      }
    }

    // 1. Kiểm tra trùng tên
    if (body.name && body.name !== existing.name) {
      const [nameConflict] = await db
        .select({ id: accessRoles.id })
        .from(accessRoles)
        .where(
          and(eq(accessRoles.name, body.name), ne(accessRoles.id, roleId)),
        )
        .limit(1)

      if (nameConflict) {
        throw new ConflictError("Tên vai trò truy cập đã tồn tại")
      }
    }

    const targetScope = body.scope ?? existing.scope

    // 2. Kiểm tra vai trò cha & Chống đệ quy vòng (Cycle Detection)
    if (body.parentId !== undefined) {
      if (body.parentId === roleId) {
        throw new BadRequestError("Vai trò không thể tự kế thừa chính nó")
      }

      if (body.parentId !== null) {
        const [parent] = await db
          .select({ id: accessRoles.id, scope: accessRoles.scope })
          .from(accessRoles)
          .where(eq(accessRoles.id, body.parentId))
          .limit(1)

        if (!parent) {
          throw new BadRequestError("Vai trò cha không tồn tại")
        }

        if (parent.scope !== targetScope) {
          throw new BadRequestError(
            `Vai trò kế thừa phải có cùng phạm vi (${targetScope})`,
          )
        }

        // Chống đệ quy vòng: kiểm tra xem roleId có phải là tổ tiên của parentId không
        const cycleCheck = await db.execute<{ id: number }>(sql`
          WITH RECURSIVE ancestor_tree AS (
            SELECT id, parent_id FROM access_roles WHERE id = ${body.parentId}
            UNION ALL
            SELECT r.id, r.parent_id FROM access_roles r
            INNER JOIN ancestor_tree at ON r.id = at.parent_id
          )
          SELECT id FROM ancestor_tree WHERE id = ${roleId} LIMIT 1
        `)

        if ((cycleCheck as unknown as Array<{ id: number }>).length > 0) {
          throw new BadRequestError(
            "Phát hiện đệ quy vòng: Vai trò cha không thể là vai trò con cháu của chính nó",
          )
        }
      }
    }

    // 3. Cập nhật bảng access_roles
    const updateData: Partial<typeof accessRoles.$inferInsert> = {
      updatedAt: new Date().toISOString(),
    }
    if (body.name !== undefined) updateData.name = body.name
    if (body.scope !== undefined) updateData.scope = body.scope
    if (body.description !== undefined) updateData.description = body.description
    if (body.parentId !== undefined) updateData.parentId = body.parentId

    const [updated] = await db
      .update(accessRoles)
      .set(updateData)
      .where(eq(accessRoles.id, roleId))
      .returning()

    // 4. Đồng bộ danh sách quyền nếu có truyền
    if (body.permissionIds !== undefined) {
      await db
        .delete(accessRolePermissions)
        .where(eq(accessRolePermissions.accessRoleId, roleId))

      if (body.permissionIds.length > 0) {
        const uniquePermissionIds = Array.from(new Set(body.permissionIds))
        await db.insert(accessRolePermissions).values(
          uniquePermissionIds.map((pId) => ({
            accessRoleId: roleId,
            permissionId: pId,
          })),
        )
      }
    }

    return {
      data: updated,
      message: "Cập nhật vai trò truy cập thành công",
    }
  },
})

export const DELETE = createApiHandler({
  permissions: [PERMISSIONS.ACCESS_ROLE_DELETE],
  paramsSchema: IdParamSchema,
  handler: async ({ params }) => {
    const roleId = params.id

    const [role] = await db
      .select({
        id: accessRoles.id,
        isSystem: accessRoles.isSystem,
        name: accessRoles.name,
      })
      .from(accessRoles)
      .where(eq(accessRoles.id, roleId))
      .limit(1)

    if (!role) {
      throw new NotFoundError("Không tìm thấy vai trò truy cập")
    }

    if (role.isSystem) {
      throw new BadRequestError(
        "Không thể xóa vai trò mặc định của hệ thống",
      )
    }

    // 1. Kiểm tra vai trò con kế thừa
    const [child] = await db
      .select({ id: accessRoles.id })
      .from(accessRoles)
      .where(eq(accessRoles.parentId, roleId))
      .limit(1)

    if (child) {
      throw new BadRequestError(
        "Không thể xóa vai trò vì đang có các vai trò khác kế thừa từ nó",
      )
    }

    // 2. Kiểm tra gán cho người dùng trong user_access_roles
    const [userAssignment] = await db
      .select({ userId: userAccessRoles.userId })
      .from(userAccessRoles)
      .where(eq(userAccessRoles.accessRoleId, roleId))
      .limit(1)

    if (userAssignment) {
      throw new BadRequestError(
        "Không thể xóa vai trò vì đang được gán cho người dùng hệ thống",
      )
    }

    // 3. Kiểm tra gán trong các dự án qua user_projects
    const [projectAssignment] = await db
      .select({ id: userProjects.id })
      .from(userProjects)
      .where(eq(userProjects.accessRoleId, roleId))
      .limit(1)

    if (projectAssignment) {
      throw new BadRequestError(
        "Không thể xóa vai trò vì đang được gán cho nhân sự trong dự án",
      )
    }

    // 4. Xóa liên kết quyền và vai trò
    await db
      .delete(accessRolePermissions)
      .where(eq(accessRolePermissions.accessRoleId, roleId))

    await db.delete(accessRoles).where(eq(accessRoles.id, roleId))

    return {
      message: "Xóa vai trò truy cập thành công",
    }
  },
})
