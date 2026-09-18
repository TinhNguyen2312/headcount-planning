import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm"
import { db, regions, sectors } from "@/db"
import {
  BadRequestError,
  ConflictError,
  createApiHandler,
  createPaginationMeta,
  PERMISSIONS,
} from "@/server/core"
import {
  CreateRegionSchema,
  QueryRegionSchema,
} from "@/server/schemas/region.schema"

const formatRegionRow = (row: any) => ({
  region: {
    ...row.region,
    sector: row.sector,
  },
})

export const GET = createApiHandler({
  permissions: [PERMISSIONS.REGION_VIEW],
  querySchema: QueryRegionSchema,
  handler: async ({ query }) => {
    const page = query.page ?? 0
    const limit = Math.min(200, query.limit ?? 100)
    const offset = page * limit
    const order = query.order === "asc" ? "asc" : "desc"

    const conditions: SQL[] = []

    if (query.sectorId !== undefined && !isNaN(query.sectorId)) {
      conditions.push(eq(regions.sectorId, query.sectorId))
    }

    if (query.keyword) {
      const kw = or(
        ilike(regions.name, `%${query.keyword}%`),
        ilike(regions.code, `%${query.keyword}%`),
      )
      if (kw) conditions.push(kw)
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(regions)
      .where(whereClause)

    const rows = await db
      .select({
        region: regions,
        sector: sectors,
      })
      .from(regions)
      .leftJoin(sectors, eq(regions.sectorId, sectors.id))
      .where(whereClause)
      .orderBy(order === "asc" ? asc(regions.id) : desc(regions.id))
      .offset(offset)
      .limit(limit)

    return {
      data: rows.map(formatRegionRow),
      message: "Thành công",
      meta: createPaginationMeta(page, limit, Number(total)),
    }
  },
})

export const POST = createApiHandler({
  permissions: [PERMISSIONS.REGION_CREATE],
  bodySchema: CreateRegionSchema,
  handler: async ({ body }) => {
    if (body.code) {
      const [existing] = await db
        .select({ id: regions.id })
        .from(regions)
        .where(eq(regions.code, body.code))
        .limit(1)

      if (existing) {
        throw new ConflictError("Mã vùng đã tồn tại")
      }
    }

    const [sector] = await db
      .select({ id: sectors.id })
      .from(sectors)
      .where(eq(sectors.id, body.sectorId))
      .limit(1)

    if (!sector) {
      throw new BadRequestError("Khu vực không tồn tại")
    }

    const [created] = await db.insert(regions).values(body).returning()

    return {
      data: created,
      message: "Tạo vùng thành công",
    }
  },
})
