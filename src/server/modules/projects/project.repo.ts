import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  or,
  type SQL,
  sql,
} from "drizzle-orm"
import {
  db,
  projects,
  properties,
  propertyValues,
  regions,
  sectors,
} from "@/db"
import { calculatePagination } from "@/server/core/pagination"
import type {
  CreateProjectInput,
  QueryProjectInput,
  SaveProjectPropertiesInput,
  UpdateProjectInput,
} from "./project.schema"

const formatProjectRow = (row) => ({
  project: {
    ...row.project,
    region: row.region,
    sector: row.sector,
  },
})

export class ProjectRepository {
  static async findManyAndCount(query: QueryProjectInput) {
    const { page, limit, offset } = calculatePagination(query.page, query.limit)
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
      rows: rows.map(formatProjectRow),
      total: Number(total),
      page,
      limit,
    }
  }

  static async findById(id: number) {
    const [row] = await db
      .select({
        project: projects,
        region: regions,
        sector: sectors,
      })
      .from(projects)
      .leftJoin(regions, eq(projects.regionId, regions.id))
      .leftJoin(sectors, eq(regions.sectorId, sectors.id))
      .where(eq(projects.id, id))

    return row ? formatProjectRow(row) : null
  }

  static async findByCode(code: string) {
    const [row] = await db
      .select({ id: projects.id, code: projects.code })
      .from(projects)
      .where(eq(projects.code, code))

    return row || null
  }

  static async create(input: CreateProjectInput) {
    const [created] = await db
      .insert(projects)
      .values({
        ...input,
        status: input.status || "ACTIVE",
      })
      .returning()

    return created || null
  }

  static async update(id: number, input: UpdateProjectInput) {
    const [updated] = await db
      .update(projects)
      .set(input)
      .where(eq(projects.id, id))
      .returning()

    if (!updated) return null
    return await this.findById(id)
  }

  static async delete(id: number) {
    const [deleted] = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning()

    return deleted || null
  }

  static async getProperties(projectId: number) {
    const activeProperties = await db
      .select()
      .from(properties)
      .where(eq(properties.isActive, true))
      .orderBy(properties.id)

    const existingValues = await db
      .select()
      .from(propertyValues)
      .where(eq(propertyValues.projectId, projectId))

    return {
      properties: activeProperties,
      values: existingValues,
    }
  }

  static async saveProperties(
    projectId: number,
    values: SaveProjectPropertiesInput["values"],
  ) {
    if (values.length === 0) return

    const rowsToInsert = values.map((item) => ({
      projectId,
      propertyId: item.propertyId,
      projectType: item.projectType || "ALL",
      valueNumber: item.valueNumber ? String(item.valueNumber) : null,
      valueText: item.valueText ? item.valueText.trim() : null,
      updatedAt: new Date().toISOString(),
    }))

    await db
      .insert(propertyValues)
      .values(rowsToInsert)
      .onConflictDoUpdate({
        target: [
          propertyValues.projectId,
          propertyValues.propertyId,
          propertyValues.projectType,
        ],
        set: {
          valueNumber: sql`excluded.value_number`,
          valueText: sql`excluded.value_text`,
          updatedAt: sql`excluded.updated_at`,
        },
      })
  }
}
