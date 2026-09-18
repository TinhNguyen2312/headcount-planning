import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm"
import { db, departments, roles } from "@/db"
import {
  BadRequestError,
  ConflictError,
  createApiHandler,
  createPaginationMeta,
  PERMISSIONS,
} from "@/server/core"
import {
  CreateRoleSchema,
  QueryRoleSchema,
} from "@/server/schemas/role.schema"

const formatRoleRow = (row: any) => ({
  role: {
    ...row.role,
    department: row.department,
  },
})

export const GET = createApiHandler({
  permissions: [PERMISSIONS.ROLE_VIEW],
  querySchema: QueryRoleSchema,
  handler: async ({ query }) => {
    const page = query.page ?? 0
    const limit = Math.min(200, query.limit ?? 100)
    const offset = page * limit
    const order = query.order === "asc" ? "asc" : "desc"

    const conditions: SQL[] = []

    if (query.departmentId !== undefined && !isNaN(query.departmentId)) {
      conditions.push(eq(roles.departmentId, query.departmentId))
    }

    if (query.parentRoleId !== undefined && !isNaN(query.parentRoleId)) {
      conditions.push(eq(roles.parentRoleId, query.parentRoleId))
    }

    if (query.planningMethod) {
      conditions.push(eq(roles.planningMethod, query.planningMethod))
    }

    if (query.keyword) {
      const kw = or(
        ilike(roles.name, `%${query.keyword}%`),
        ilike(roles.shortCode, `%${query.keyword}%`),
        ilike(roles.code, `%${query.keyword}%`),
      )
      if (kw) conditions.push(kw)
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(roles)
      .where(whereClause)

    const rows = await db
      .select({
        role: roles,
        department: departments,
      })
      .from(roles)
      .leftJoin(departments, eq(roles.departmentId, departments.id))
      .where(whereClause)
      .orderBy(order === "asc" ? asc(roles.id) : desc(roles.id))
      .offset(offset)
      .limit(limit)

    return {
      data: rows.map(formatRoleRow),
      message: "Thành công",
      meta: createPaginationMeta(page, limit, Number(total)),
    }
  },
})

export const POST = createApiHandler({
  permissions: [PERMISSIONS.ROLE_CREATE],
  bodySchema: CreateRoleSchema,
  handler: async ({ body }) => {
    if (body.code) {
      const [existing] = await db
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.code, body.code))
        .limit(1)
      if (existing) {
        throw new ConflictError("Mã chức danh đã tồn tại")
      }
    }

    if (body.departmentId) {
      const [dept] = await db
        .select({ id: departments.id })
        .from(departments)
        .where(eq(departments.id, body.departmentId))
        .limit(1)
      if (!dept) {
        throw new BadRequestError("Phòng ban không tồn tại")
      }
    }

    if (body.parentRoleId) {
      const [parent] = await db
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.id, body.parentRoleId))
        .limit(1)
      if (!parent) {
        throw new BadRequestError("Chức danh cha không tồn tại")
      }
    }

    const [created] = await db.insert(roles).values(body).returning()
    return {
      data: created,
      message: "Tạo chức danh thành công",
    }
  },
})
