import { NextRequest } from "next/server"
import { ilike, or, count, desc, asc, eq, and, type SQL } from "drizzle-orm"
import { db, projects, regions, sectors } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess, createPaginationMeta } from "@/lib/apiResponse"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const keyword = searchParams.get("keyword") || ""
    const status = searchParams.get("status")
    const regionIdParam = searchParams.get("regionId")
    const regionId = regionIdParam ? parseInt(regionIdParam, 10) : undefined
    const sectorIdParam = searchParams.get("sectorId")
    const sectorId = sectorIdParam ? parseInt(sectorIdParam, 10) : undefined
    const page = parseInt(searchParams.get("page") || "0", 10)
    const limit = Math.min(
      200,
      parseInt(searchParams.get("limit") || "100", 10),
    )
    const order =
      searchParams.get("order")?.toLowerCase() === "asc" ? "asc" : "desc"

    const conditions: SQL[] = []
    if (status) conditions.push(eq(projects.status, status))
    if (regionId !== undefined && !isNaN(regionId))
      conditions.push(eq(projects.regionId, regionId))
    if (sectorId !== undefined && !isNaN(sectorId))
      conditions.push(eq(regions.sectorId, sectorId))
    if (keyword) {
      const kw = or(
        ilike(projects.name, `%${keyword}%`),
        ilike(projects.code, `%${keyword}%`),
      )
      if (kw) conditions.push(kw)
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const countQuery = db
      .select({ value: count() })
      .from(projects)
      .leftJoin(regions, eq(projects.regionId, regions.id))

    const [{ value: total }] = await (whereClause
      ? countQuery.where(whereClause)
      : countQuery)

    const rows = await db
      .select({
        id: projects.id,
        code: projects.code,
        name: projects.name,
        address: projects.address,
        generalInfo: projects.generalInfo,
        regionId: projects.regionId,
        status: projects.status,
        startDate: projects.startDate,
        endDate: projects.endDate,
        thumbnail: projects.thumbnail,
        createdAt: projects.createdAt,
        regionName: regions.name,
        regionCode: regions.code,
        sectorId: regions.sectorId,
        sectorName: sectors.name,
      })
      .from(projects)
      .leftJoin(regions, eq(projects.regionId, regions.id))
      .leftJoin(sectors, eq(regions.sectorId, sectors.id))
      .where(whereClause)
      .orderBy(order === "asc" ? asc(projects.id) : desc(projects.id))
      .offset(page * limit)
      .limit(limit)

    return apiSuccess(
      rows,
      "Thành công",
      createPaginationMeta(page, limit, Number(total)),
    )
  } catch (error) {
    console.error("Get projects error:", error)
    return apiError("Lỗi lấy danh sách dự án", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getCurrentUserFromSession(sessionId)
    if (!user) return apiError("Chưa đăng nhập", 401, 401)

    const body = await req.json()
    const {
      name,
      code,
      address,
      generalInfo,
      regionId,
      status,
      startDate,
      endDate,
      thumbnail,
    } = body

    if (!name || !name.trim())
      return apiError("Tên dự án không được để trống", 422)

    if (code && code.trim()) {
      const [existing] = await db
        .select()
        .from(projects)
        .where(eq(projects.code, code.trim()))
      if (existing) return apiError("Mã dự án đã tồn tại", 409)
    }

    const [created] = await db
      .insert(projects)
      .values({
        name: name.trim(),
        code: code ? code.trim() : null,
        address: address || null,
        generalInfo: generalInfo || null,
        regionId: regionId || null,
        status: status || "ACTIVE",
        startDate: startDate || null,
        endDate: endDate || null,
        thumbnail: thumbnail || null,
      })
      .returning()

    return apiSuccess(created, "Tạo dự án thành công")
  } catch (error) {
    console.error("Create project error:", error)
    return apiError("Lỗi tạo dự án", 500)
  }
}
