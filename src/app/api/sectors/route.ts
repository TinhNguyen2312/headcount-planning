import { NextRequest } from "next/server"
import { ilike, or, count, desc, asc, eq } from "drizzle-orm"
import { db, sectors } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess, createPaginationMeta } from "@/lib/apiResponse"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const keyword = searchParams.get("keyword") || ""
    const page = parseInt(searchParams.get("page") || "0", 10)
    const limit = Math.min(
      200,
      parseInt(searchParams.get("limit") || "100", 10),
    )
    const order =
      searchParams.get("order")?.toLowerCase() === "asc" ? "asc" : "desc"

    const whereCondition = keyword
      ? or(
          ilike(sectors.name, `%${keyword}%`),
          ilike(sectors.code, `%${keyword}%`),
        )
      : undefined

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(sectors)
      .where(whereCondition)

    const items = await db
      .select()
      .from(sectors)
      .where(whereCondition)
      .orderBy(order === "asc" ? asc(sectors.id) : desc(sectors.id))
      .offset(page * limit)
      .limit(limit)

    return apiSuccess(
      items,
      "Thành công",
      createPaginationMeta(page, limit, Number(total)),
    )
  } catch (error) {
    console.error("Get sectors error:", error)
    return apiError("Lỗi lấy danh sách khu vực", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getCurrentUserFromSession(sessionId)
    if (!user) return apiError("Chưa đăng nhập", 401, 401)

    const body = await req.json()
    const { name, code, description } = body

    if (!name || !name.trim()) {
      return apiError("Tên khu vực không được để trống", 422)
    }

    if (code && code.trim()) {
      const [existing] = await db
        .select()
        .from(sectors)
        .where(eq(sectors.code, code.trim()))
      if (existing) {
        return apiError("Mã khu vực đã tồn tại", 409)
      }
    }

    const [created] = await db
      .insert(sectors)
      .values({
        name: name.trim(),
        code: code ? code.trim() : null,
        description: description || null,
      })
      .returning()

    return apiSuccess(created, "Tạo khu vực thành công")
  } catch (error) {
    console.error("Create sector error:", error)
    return apiError("Lỗi tạo khu vực", 500)
  }
}
