import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
import { accessRolePermissions, accessRoles, db } from "@/db"
import {
  BadRequestError,
  ConflictError,
  createApiHandler,
  createPaginationMeta,
  PERMISSIONS,
} from "@/server/core"
import {
  CreateAccessRoleSchema,
  QueryAccessRoleSchema,
} from "@/server/schemas"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.ACCESS_ROLE_VIEW],
  querySchema: QueryAccessRoleSchema,
  handler: async ({ query }) => {
    const page = query.page ?? 0
    const limit = Math.min(200, query.limit ?? 100)
    const offset = page * limit
    const order = query.order === "asc" ? "asc" : "desc"

    const conditions: SQL[] = []

    if (query.scope) {
      conditions.push(eq(accessRoles.scope, query.scope))
    }

    if (query.parentId !== undefined && !isNaN(query.parentId)) {
      conditions.push(eq(accessRoles.parentId, query.parentId))
    }

    if (query.keyword) {
      const kw = or(
        ilike(accessRoles.name, `%${query.keyword}%`),
        ilike(accessRoles.description, `%${query.keyword}%`),
      )
      if (kw) conditions.push(kw)
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(accessRoles)
      .where(whereClause)

    const parentRoles = alias(accessRoles, "parent_roles")

    const rows = await db
      .select({
        role: accessRoles,
        parentRole: parentRoles,
        permissionsCount: count(accessRolePermissions.permissionId),
      })
      .from(accessRoles)
      .leftJoin(parentRoles, eq(accessRoles.parentId, parentRoles.id))
      .leftJoin(
        accessRolePermissions,
        eq(accessRoles.id, accessRolePermissions.accessRoleId),
      )
      .where(whereClause)
      .groupBy(accessRoles.id, parentRoles.id)
      .orderBy(order === "asc" ? asc(accessRoles.id) : desc(accessRoles.id))
      .offset(offset)
      .limit(limit)

    return {
      data: rows.map((row) => ({
        ...row.role,
        parentName: row.parentRole?.name ?? null,
        parent: row.parentRole ?? null,
        permissionsCount: Number(row.permissionsCount ?? 0),
      })),
      message: "Thành công",
      meta: createPaginationMeta(page, limit, Number(total)),
    }
  },
})

export const POST = createApiHandler({
  permissions: [PERMISSIONS.ACCESS_ROLE_CREATE],
  bodySchema: CreateAccessRoleSchema,
  handler: async ({ body, user }) => {
    // 1. Kiểm tra trùng tên vai trò
    const [existing] = await db
      .select({ id: accessRoles.id })
      .from(accessRoles)
      .where(eq(accessRoles.name, body.name))
      .limit(1)

    if (existing) {
      throw new ConflictError("Tên vai trò truy cập đã tồn tại")
    }

    // 2. Kiểm tra vai trò cha nếu có
    if (body.parentId) {
      const [parent] = await db
        .select({ id: accessRoles.id, scope: accessRoles.scope })
        .from(accessRoles)
        .where(eq(accessRoles.id, body.parentId))
        .limit(1)

      if (!parent) {
        throw new BadRequestError("Vai trò cha không tồn tại")
      }

      if (parent.scope !== body.scope) {
        throw new BadRequestError(
          `Vai trò kế thừa phải có cùng phạm vi (${body.scope})`,
        )
      }
    }

    // 3. Tạo vai trò mới
    const [created] = await db
      .insert(accessRoles)
      .values({
        name: body.name,
        scope: body.scope,
        description: body.description ?? null,
        parentId: body.parentId ?? null,
        createdBy: user?.id ?? null,
      })
      .returning()

    // 4. Gán quyền nếu có
    if (body.permissionIds && body.permissionIds.length > 0) {
      const uniquePermissionIds = Array.from(new Set(body.permissionIds))
      await db.insert(accessRolePermissions).values(
        uniquePermissionIds.map((pId) => ({
          accessRoleId: created.id,
          permissionId: pId,
        })),
      )
    }

    return {
      data: created,
      message: "Tạo vai trò truy cập thành công",
    }
  },
})
