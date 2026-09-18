import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm"
import { db, regions, sectors, projects } from "@/db"
import { calculatePagination } from "@/server/core/pagination"
import type {
  CreateRegionInput,
  QueryRegionInput,
  UpdateRegionInput,
} from "./region.schema"

const formatRegionRow = (row: any) => ({
  region: {
    ...row.region,
    sector: row.sector,
  },
})

export class RegionRepository {
  static async findManyAndCount(query: QueryRegionInput) {
    const { page, limit, offset } = calculatePagination(query.page, query.limit)
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
      rows: rows.map(formatRegionRow),
      total: Number(total),
      page,
      limit,
    }
  }

  static async findById(id: number) {
    const [row] = await db
      .select({
        region: regions,
        sector: sectors,
      })
      .from(regions)
      .leftJoin(sectors, eq(regions.sectorId, sectors.id))
      .where(eq(regions.id, id))

    return row ? formatRegionRow(row) : null
  }

  static async findByCode(code: string) {
    const [region] = await db
      .select()
      .from(regions)
      .where(eq(regions.code, code))
    return region || null
  }

  static async hasProjects(regionId: number) {
    const [existing] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.regionId, regionId))
      .limit(1)
    return Boolean(existing)
  }

  static async create(input: CreateRegionInput) {
    const [created] = await db
      .insert(regions)
      .values(input)
      .returning()
    return created
  }

  static async update(id: number, input: UpdateRegionInput) {
    const [updated] = await db
      .update(regions)
      .set(input)
      .where(eq(regions.id, id))
      .returning()
    return updated || null
  }

  static async delete(id: number) {
    await db.delete(regions).where(eq(regions.id, id))
  }
}
