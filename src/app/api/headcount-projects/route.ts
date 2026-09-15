import { NextRequest } from "next/server"
import { ilike, or, and, count, desc, asc, eq, type SQL } from "drizzle-orm"
import { db, headcountProjects, projects, regions, sectors } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess, createPaginationMeta } from "@/lib/apiResponse"
import type {
  HeadcountProjectCreatePayload,
  HeadcountProjectResponse,
} from "@/types"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const keyword = searchParams.get("keyword")?.trim() || ""
    const isActiveParam = searchParams.get("isActive")
    const regionIdParam = searchParams.get("regionId")
    const sectorIdParam = searchParams.get("sectorId")
    const page = parseInt(searchParams.get("page") || "0", 10)
    const limit = Math.min(500, parseInt(searchParams.get("limit") || "50", 10))
    const order =
      searchParams.get("order")?.toLowerCase() === "asc" ? "asc" : "desc"

    const conditions: SQL[] = []

    if (
      isActiveParam !== null &&
      isActiveParam !== undefined &&
      isActiveParam !== ""
    ) {
      conditions.push(eq(headcountProjects.isActive, isActiveParam === "true"))
    }

    if (regionIdParam) {
      conditions.push(eq(projects.regionId, parseInt(regionIdParam, 10)))
    }

    if (sectorIdParam) {
      conditions.push(eq(regions.sectorId, parseInt(sectorIdParam, 10)))
    }

    if (keyword) {
      const searchPattern = `%${keyword}%`
      conditions.push(
        or(
          ilike(projects.name, searchPattern),
          ilike(projects.code, searchPattern),
          ilike(headcountProjects.note, searchPattern),
        )!,
      )
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // 1. Total count query
    const [{ total }] = await db
      .select({ total: count() })
      .from(headcountProjects)
      .innerJoin(projects, eq(headcountProjects.projectId, projects.id))
      .leftJoin(regions, eq(projects.regionId, regions.id))
      .leftJoin(sectors, eq(regions.sectorId, sectors.id))
      .where(whereClause)

    // 2. Data rows query
    const rows = await db
      .select({
        id: headcountProjects.id,
        projectId: headcountProjects.projectId,
        isActive: headcountProjects.isActive,
        note: headcountProjects.note,
        createdAt: headcountProjects.createdAt,
        updatedAt: headcountProjects.updatedAt,
        project: {
          id: projects.id,
          code: projects.code,
          name: projects.name,
          address: projects.address,
          startDate: projects.startDate,
          endDate: projects.endDate,
          status: projects.status,
          thumbnail: projects.thumbnail,
          regionId: regions.id,
          regionName: regions.name,
          sectorId: sectors.id,
          sectorName: sectors.name,
        },
      })
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
      .offset(page * limit)
      .limit(limit)

    return apiSuccess(
      rows,
      "Lấy danh sách dự án định biên thành công",
      createPaginationMeta(page, limit, Number(total)),
    )
  } catch (error: any) {
    console.error("GET /api/headcount-projects error:", error)
    return apiError(
      "Lỗi hệ thống khi lấy danh sách dự án định biên",
      500,
      500,
      error.message,
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getCurrentUserFromSession(sessionId)
    if (!user) {
      return apiError("Chưa đăng nhập", 401, 401)
    }

    const body: HeadcountProjectCreatePayload = await req.json()

    if (!body.projectId) {
      return apiError("Vui lòng chọn dự án để kích hoạt", 400, 400)
    }

    // Verify project exists
    const [existingProject] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, body.projectId))
      .limit(1)

    if (!existingProject) {
      return apiError("Dự án không tồn tại trong hệ thống", 404, 404)
    }

    // Check if already in headcount_projects
    const [existingHP] = await db
      .select({ id: headcountProjects.id })
      .from(headcountProjects)
      .where(eq(headcountProjects.projectId, body.projectId))
      .limit(1)

    if (existingHP) {
      return apiError(
        "Dự án này đã có trong danh sách chạy định biên",
        409,
        409,
      )
    }

    const [created] = await db
      .insert(headcountProjects)
      .values({
        projectId: body.projectId,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        note: body.note?.trim() || null,
      })
      .returning()

    return apiSuccess(created, "Kích hoạt dự án chạy định biên thành công")
  } catch (error: any) {
    console.error("POST /api/headcount-projects error:", error)
    return apiError(
      "Lỗi hệ thống khi kích hoạt dự án chạy định biên",
      500,
      500,
      error.message,
    )
  }
}
