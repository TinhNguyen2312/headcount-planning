import { NextRequest } from "next/server"
import { ilike, or, count, desc, asc, eq, and, type SQL } from "drizzle-orm"
import { db, departments } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess, createPaginationMeta } from "@/lib/apiResponse"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const keyword = searchParams.get("keyword") || ""
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const level = searchParams.get("level")
      ? parseInt(searchParams.get("level")!, 10)
      : undefined
    const parentId = searchParams.get("parentId")
      ? parseInt(searchParams.get("parentId")!, 10)
      : undefined
    const page = parseInt(searchParams.get("page") || "0", 10)
    const limit = Math.min(
      200,
      parseInt(searchParams.get("limit") || "100", 10),
    )
    const order =
      searchParams.get("order")?.toLowerCase() === "asc" ? "asc" : "desc"

    const conditions: SQL[] = []
    if (status) conditions.push(eq(departments.status, status))
    if (type) conditions.push(eq(departments.type, type))
    if (level !== undefined && !isNaN(level))
      conditions.push(eq(departments.level, level))
    if (parentId !== undefined && !isNaN(parentId))
      conditions.push(eq(departments.parentId, parentId))
    if (keyword) {
      const kw = or(
        ilike(departments.name, `%${keyword}%`),
        ilike(departments.code, `%${keyword}%`),
      )
      if (kw) conditions.push(kw)
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(departments)
      .where(whereClause)

    const rows = await db
      .select()
      .from(departments)
      .where(whereClause)
      .orderBy(order === "asc" ? asc(departments.id) : desc(departments.id))
      .offset(page * limit)
      .limit(limit)

    return apiSuccess(
      rows,
      "Thành công",
      createPaginationMeta(page, limit, Number(total)),
    )
  } catch (error) {
    console.error("Get departments error:", error)
    return apiError("Lỗi lấy danh sách phòng ban", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getCurrentUserFromSession(sessionId)
    if (!user) return apiError("Chưa đăng nhập", 401, 401)

    const body = await req.json()
    const { name, code, type, level, parentId, status, description } = body

    if (!name || !name.trim())
      return apiError("Tên phòng ban không được để trống", 422)
    if (!code || !code.trim())
      return apiError("Mã phòng ban không được để trống", 422)

    const [existing] = await db
      .select()
      .from(departments)
      .where(eq(departments.code, code.trim()))
    if (existing) return apiError("Mã phòng ban đã tồn tại", 409)

    const [created] = await db
      .insert(departments)
      .values({
        name: name.trim(),
        code: code.trim(),
        type: type || "Department",
        level: level || 1,
        parentId: parentId || null,
        status: status || "ACTIVE",
        description: description || null,
      })
      .returning()

    return apiSuccess(created, "Tạo phòng ban thành công")
  } catch (error) {
    console.error("Create department error:", error)
    return apiError("Lỗi tạo phòng ban", 500)
  }
}
