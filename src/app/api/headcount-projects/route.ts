import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm"
import { db, headcountProjects, projects, regions, sectors } from "@/db"
import {
  ConflictError,
  createApiHandler,
  createPaginationMeta,
  NotFoundError,
  PERMISSIONS,
} from "@/server/core"
import {
  CreateHeadcountProjectSchema,
  QueryHeadcountProjectSchema,
} from "@/server/schemas/headcount-project.schema"
import {
  formatHeadcountProjectRow,
  headcountProjectSelection,
} from "./helper"

export const GET = createApiHandler({
  permissions: [PERMISSIONS.HEADCOUNT_PROJECT_VIEW],
  querySchema: QueryHeadcountProjectSchema,
  handler: async ({ query }) => {
    const page = query.page ?? 0
    const limit = Math.min(500, query.limit ?? 50)
    const offset = page * limit
    const order = query.order === "asc" ? "asc" : "desc"

    const conditions: SQL[] = []

    if (query.isActive !== undefined) {
      conditions.push(eq(headcountProjects.isActive, query.isActive))
    }

    if (query.regionId !== undefined && !isNaN(query.regionId)) {
      conditions.push(eq(projects.regionId, query.regionId))
    }

    if (query.sectorId !== undefined && !isNaN(query.sectorId)) {
      conditions.push(eq(regions.sectorId, query.sectorId))
    }

    if (query.keyword) {
      const searchPattern = `%${query.keyword.trim()}%`
      conditions.push(
        or(
          ilike(projects.name, searchPattern),
          ilike(projects.code, searchPattern),
          ilike(headcountProjects.note, searchPattern),
        )!,
      )
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [{ total }] = await db
      .select({ total: count() })
      .from(headcountProjects)
      .innerJoin(projects, eq(headcountProjects.projectId, projects.id))
      .leftJoin(regions, eq(projects.regionId, regions.id))
      .leftJoin(sectors, eq(regions.sectorId, sectors.id))
      .where(whereClause)

    const rows = await db
      .select(headcountProjectSelection)
      .from(headcountProjects)
      .innerJoin(projects, eq(headcountProjects.projectId, projects.id))
      .leftJoin(regions, eq(projects.regionId, regions.id))
      .leftJoin(sectors, eq(regions.sectorId, sectors.id))
      .where(whereClause)
      .orderBy(
        order === "asc"
          ? asc(headcountProjects.createdAt)
          : desc(headcountProjects.createdAt),
      )
      .offset(offset)
      .limit(limit)

    return {
      data: rows.map(formatHeadcountProjectRow),
      message: "Lấy danh sách dự án định biên thành công",
      meta: createPaginationMeta(page, limit, Number(total)),
    }
  },
})

export const POST = createApiHandler({
  permissions: [PERMISSIONS.HEADCOUNT_PROJECT_CREATE],
  bodySchema: CreateHeadcountProjectSchema,
  handler: async ({ body }) => {
    const [existingProject] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, body.projectId))
      .limit(1)

    if (!existingProject) {
      throw new NotFoundError("Dự án không tồn tại trong hệ thống")
    }

    const [existingHP] = await db
      .select({ id: headcountProjects.id })
      .from(headcountProjects)
      .where(eq(headcountProjects.projectId, body.projectId))
      .limit(1)

    if (existingHP) {
      throw new ConflictError("Dự án này đã có trong danh sách chạy định biên")
    }

    const [created] = await db
      .insert(headcountProjects)
      .values({
        projectId: body.projectId,
        isActive: body.isActive,
        note: body.note?.trim() || null,
      })
      .returning()

    return {
      data: created,
      message: "Kích hoạt dự án chạy định biên thành công",
    }
  },
})
