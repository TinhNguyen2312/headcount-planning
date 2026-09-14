import { NextRequest } from "next/server"
import { ilike, or, count, desc, asc, eq, and, type SQL } from "drizzle-orm"
import { db, regions, sectors } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess, createPaginationMeta } from "@/lib/apiResponse"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sectorIdParam = searchParams.get("sectorId")
    const sectorId = sectorIdParam ? parseInt(sectorIdParam, 10) : undefined
    const keyword = searchParams.get("keyword") || ""
    const page = parseInt(searchParams.get("page") || "0", 10)
    const limit = Math.min(
      200,
      parseInt(searchParams.get("limit") || "100", 10),
    )
    const order =
      searchParams.get("order")?.toLowerCase() === "asc" ? "asc" : "desc"

    const conditions: SQL[] = []
    if (sectorId !== undefined && !isNaN(sectorId)) {
      conditions.push(eq(regions.sectorId, sectorId))
    }
    if (keyword) {
      const kw = or(
        ilike(regions.name, `%${keyword}%`),
        ilike(regions.code, `%${keyword}%`),
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
        id: regions.id,
        sectorId: regions.sectorId,
        code: regions.code,
        name: regions.name,
        description: regions.description,
        createdAt: regions.createdAt,
        sectorName: sectors.name,
        sectorCode: sectors.code,
      })
      .from(regions)
      .leftJoin(sectors, eq(regions.sectorId, sectors.id))
      .where(whereClause)
      .orderBy(order === "asc" ? asc(regions.id) : desc(regions.id))
      .offset(page * limit)
      .limit(limit)

    return apiSuccess(
      rows,
      "Thành công",
      createPaginationMeta(page, limit, Number(total)),
    )
  } catch (error) {
    console.error("Get regions error:", error)
    return apiError("Lỗi lấy danh sách vùng", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getCurrentUserFromSession(sessionId)
    if (!user) return apiError("Chưa đăng nhập", 401, 401)

    const body = await req.json()
    const { name, code, sectorId, description } = body

    if (!name || !name.trim())
      return apiError("Tên vùng không được để trống", 422)
    if (!sectorId) return apiError("Khu vực không được để trống", 422)

    if (code && code.trim()) {
      const [existing] = await db
        .select()
        .from(regions)
        .where(eq(regions.code, code.trim()))
      if (existing) return apiError("Mã vùng đã tồn tại", 409)
    }

    const [created] = await db
      .insert(regions)
      .values({
        name: name.trim(),
        code: code ? code.trim() : null,
        sectorId,
        description: description || null,
      })
      .returning()

    return apiSuccess(created, "Tạo vùng thành công")
  } catch (error) {
    console.error("Create region error:", error)
    return apiError("Lỗi tạo vùng", 500)
  }
}
