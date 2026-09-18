import { asc, count, desc, eq, ilike, or } from "drizzle-orm"
import { db, sectors } from "@/db"
import {
  ConflictError,
  createApiHandler,
  createPaginationMeta,
  PERMISSIONS,
} from "@/server/core"
import {
  CreateSectorSchema,
  QuerySectorSchema,
} from "@/server/schemas/sector.schema"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.SECTOR_VIEW],
  querySchema: QuerySectorSchema,
  handler: async ({ query }) => {
    const page = query.page ?? 0
    const limit = Math.min(200, query.limit ?? 100)
    const offset = page * limit
    const order = query.order === "asc" ? "asc" : "desc"

    const whereClause = query.keyword
      ? or(
          ilike(sectors.name, `%${query.keyword}%`),
          ilike(sectors.code, `%${query.keyword}%`),
        )
      : undefined

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(sectors)
      .where(whereClause)

    const rows = await db
      .select()
      .from(sectors)
      .where(whereClause)
      .orderBy(order === "asc" ? asc(sectors.id) : desc(sectors.id))
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
  permissions: [PERMISSIONS.SECTOR_CREATE],
  bodySchema: CreateSectorSchema,
  handler: async ({ body }) => {
    if (body.code) {
      const [existing] = await db
        .select({ id: sectors.id })
        .from(sectors)
        .where(eq(sectors.code, body.code))
        .limit(1)

      if (existing) {
        throw new ConflictError("Mã khu vực đã tồn tại")
      }
    }

    const [created] = await db.insert(sectors).values(body).returning()

    return {
      data: created,
      message: "Tạo khu vực thành công",
    }
  },
})
