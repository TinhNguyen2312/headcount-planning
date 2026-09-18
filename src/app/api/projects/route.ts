import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm"
import { db, projects, regions, sectors } from "@/db"
import {
  ConflictError,
  createApiHandler,
  createPaginationMeta,
  PERMISSIONS,
} from "@/server/core"
import {
  CreateProjectSchema,
  QueryProjectSchema,
} from "@/server/schemas/project.schema"

const formatProjectRow = (row: any) => ({
  project: {
    ...row.project,
    region: row.region,
    sector: row.sector,
  },
})

export const GET = createApiHandler({
  permissions: [PERMISSIONS.PROJECT_VIEW],
  querySchema: QueryProjectSchema,
  handler: async ({ query }) => {
    const page = query.page ?? 0
    const limit = Math.min(200, query.limit ?? 100)
    const offset = page * limit
    const order = query.order === "asc" ? "asc" : "desc"

    const conditions: SQL[] = []

    if (query.status) {
      conditions.push(eq(projects.status, query.status))
    }
    if (query.regionId !== undefined && !isNaN(query.regionId)) {
      conditions.push(eq(projects.regionId, query.regionId))
    }
    if (query.sectorId !== undefined && !isNaN(query.sectorId)) {
      conditions.push(eq(regions.sectorId, query.sectorId))
    }

    const keyword = query.keyword
    if (keyword) {
      const kw = or(
        ilike(projects.name, `%${keyword}%`),
        ilike(projects.code, `%${keyword}%`),
      )
      if (kw) conditions.push(kw)
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(projects)
      .leftJoin(regions, eq(projects.regionId, regions.id))
      .where(whereClause)

    const rows = await db
      .select({
        project: projects,
        region: regions,
        sector: sectors,
      })
      .from(projects)
      .leftJoin(regions, eq(projects.regionId, regions.id))
      .leftJoin(sectors, eq(regions.sectorId, sectors.id))
      .where(whereClause)
      .orderBy(order === "asc" ? asc(projects.id) : desc(projects.id))
      .offset(offset)
      .limit(limit)

    return {
      data: rows.map(formatProjectRow),
      message: "Thành công",
      meta: createPaginationMeta(page, limit, Number(total)),
    }
  },
})

export const POST = createApiHandler({
  permissions: [PERMISSIONS.PROJECT_CREATE],
  bodySchema: CreateProjectSchema,
  handler: async ({ body }) => {
    if (body.code) {
      const [existing] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.code, body.code.trim()))
        .limit(1)

      if (existing) {
        throw new ConflictError("Mã dự án đã tồn tại trong hệ thống")
      }
    }

    const [created] = await db
      .insert(projects)
      .values({
        ...body,
        status: body.status || "ACTIVE",
      })
      .returning()

    return {
      data: created,
      message: "Tạo dự án thành công",
    }
  },
})
