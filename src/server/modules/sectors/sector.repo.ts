import { asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm"
import { db, sectors, regions } from "@/db"
import { calculatePagination } from "@/server/core/pagination"
import type {
  CreateSectorInput,
  QuerySectorInput,
  UpdateSectorInput,
} from "./sector.schema"

export class SectorRepository {
  static async findManyAndCount(query: QuerySectorInput) {
    const { page, limit, offset } = calculatePagination(query.page, query.limit)
    const order = query.order === "asc" ? "asc" : "desc"

    const conditions: SQL[] = []

    if (query.keyword) {
      const kw = or(
        ilike(sectors.name, `%${query.keyword}%`),
        ilike(sectors.code, `%${query.keyword}%`),
      )
      if (kw) conditions.push(kw)
    }

    const whereClause = conditions.length > 0 ? conditions[0] : undefined

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
      rows,
      total: Number(total),
      page,
      limit,
    }
  }

  static async findById(id: number) {
    const [sector] = await db
      .select()
      .from(sectors)
      .where(eq(sectors.id, id))
    return sector || null
  }

  static async findByCode(code: string) {
    const [sector] = await db
      .select()
      .from(sectors)
      .where(eq(sectors.code, code))
    return sector || null
  }

  static async hasRegions(sectorId: number) {
    const [existing] = await db
      .select({ id: regions.id })
      .from(regions)
      .where(eq(regions.sectorId, sectorId))
      .limit(1)
    return Boolean(existing)
  }

  static async create(input: CreateSectorInput) {
    const [created] = await db
      .insert(sectors)
      .values(input)
      .returning()
    return created
  }

  static async update(id: number, input: UpdateSectorInput) {
    const [updated] = await db
      .update(sectors)
      .set(input)
      .where(eq(sectors.id, id))
      .returning()
    return updated || null
  }

  static async delete(id: number) {
    await db.delete(sectors).where(eq(sectors.id, id))
  }
}
