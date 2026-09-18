import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm"
import { db, departments } from "@/db"
import {
  BadRequestError,
  ConflictError,
  createApiHandler,
  createPaginationMeta,
  PERMISSIONS,
} from "@/server/core"
import {
  CreateDepartmentSchema,
  QueryDepartmentSchema,
} from "@/server/schemas/department.schema"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.DEPARTMENT_VIEW],
  querySchema: QueryDepartmentSchema,
  handler: async ({ query }) => {
    const page = query.page ?? 0
    const limit = Math.min(200, query.limit ?? 100)
    const offset = page * limit
    const order = query.order === "asc" ? "asc" : "desc"

    const conditions: SQL[] = []

    if (query.status && query.status !== "ALL") {
      conditions.push(eq(departments.status, query.status))
    }

    if (query.type) {
      conditions.push(eq(departments.type, query.type))
    }

    if (query.level !== undefined && !isNaN(query.level)) {
      conditions.push(eq(departments.level, query.level))
    }

    if (query.parentId !== undefined && !isNaN(query.parentId)) {
      conditions.push(eq(departments.parentId, query.parentId))
    }

    if (query.keyword) {
      const kw = or(
        ilike(departments.name, `%${query.keyword}%`),
        ilike(departments.code, `%${query.keyword}%`),
      )
      if (kw) conditions.push(kw)
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(departments)
      .where(whereClause)

    const rows = await db
      .select()
      .from(departments)
      .where(whereClause)
      .orderBy(order === "asc" ? asc(departments.id) : desc(departments.id))
      .offset(offset)
      .limit(limit)

    return {
      data: rows,
      message: "Thành công",
      meta: createPaginationMeta(page, limit, Number(total)),
    }
  },
})

export const POST = createApiHandler({
  permissions: [PERMISSIONS.DEPARTMENT_CREATE],
  bodySchema: CreateDepartmentSchema,
  handler: async ({ body }) => {
    const [existing] = await db
      .select({ id: departments.id })
      .from(departments)
      .where(eq(departments.code, body.code))
      .limit(1)

    if (existing) {
      throw new ConflictError("Mã phòng ban đã tồn tại")
    }

    if (body.parentId) {
      const [parent] = await db
        .select({ id: departments.id })
        .from(departments)
        .where(eq(departments.id, body.parentId))
        .limit(1)

      if (!parent) {
        throw new BadRequestError("Phòng ban cha không tồn tại")
      }
    }

    const [created] = await db.insert(departments).values(body).returning()

    return {
      data: created,
      message: "Tạo phòng ban thành công",
    }
  },
})
