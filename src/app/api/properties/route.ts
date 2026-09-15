import { NextRequest } from "next/server"
import { ilike, or, and, count, desc, asc, eq, type SQL } from "drizzle-orm"
import { db, properties } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess, createPaginationMeta } from "@/lib/apiResponse"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const keyword = searchParams.get("keyword") || ""
    const dataType = searchParams.get("dataType") || ""
    const isActiveParam = searchParams.get("isActive")
    const page = parseInt(searchParams.get("page") || "0", 10)
    const limit = Math.min(
      500,
      parseInt(searchParams.get("limit") || "100", 10),
    )
    const order =
      searchParams.get("order")?.toLowerCase() === "desc" ? "desc" : "asc"

    const conditions: SQL[] = []
    if (keyword) {
      const kwCond = or(
        ilike(properties.name, `%${keyword}%`),
        ilike(properties.code, `%${keyword}%`),
      )
      if (kwCond) conditions.push(kwCond)
    }
    if (dataType) {
      conditions.push(eq(properties.dataType, dataType))
    }
    if (
      isActiveParam !== null &&
      isActiveParam !== undefined &&
      isActiveParam !== ""
    ) {
      conditions.push(eq(properties.isActive, isActiveParam === "true"))
    }

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(properties)
      .where(whereCondition)

    const items = await db
      .select({
        id: properties.id,
        code: properties.code,
        name: properties.name,
        dataType: properties.dataType,
        scope: properties.scope,
        unit: properties.unit,
        options: properties.options,
        description: properties.description,
        isActive: properties.isActive,
        createdAt: properties.createdAt,
        updatedAt: properties.updatedAt,
      })
      .from(properties)
      .where(whereCondition)
      .orderBy(order === "desc" ? desc(properties.id) : asc(properties.id))
      .offset(page * limit)
      .limit(limit)

    return apiSuccess(
      items,
      "Thành công",
      createPaginationMeta(page, limit, Number(total)),
    )
  } catch (error) {
    console.error("Get properties error:", error)
    return apiError("Lỗi lấy danh sách cơ sở định biên", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const user = await getCurrentUserFromSession(sessionId)
    if (!user) return apiError("Chưa đăng nhập", 401, 401)

    const body = await req.json()
    const {
      code,
      name,
      dataType = "NUMBER",
      scope = "COMMON",
      unit,
      options,
      description,
      isActive = true,
    } = body

    if (!code || !code.trim()) {
      return apiError("Mã thuộc tính định biên không được để trống", 422)
    }
    if (!name || !name.trim()) {
      return apiError("Tên thuộc tính định biên không được để trống", 422)
    }

    const [existing] = await db
      .select()
      .from(properties)
      .where(eq(properties.code, code.trim()))

    if (existing) {
      return apiError("Mã thuộc tính định biên đã tồn tại", 409)
    }

    const [created] = await db
      .insert(properties)
      .values({
        code: code.trim(),
        name: name.trim(),
        dataType,
        scope: scope || "COMMON",
        unit: unit?.trim() || null,
        options: options || null,
        description: description || null,
        isActive: Boolean(isActive),
      })
      .returning()

    return apiSuccess(created, "Tạo cơ sở định biên thành công")
  } catch (error) {
    console.error("Create property error:", error)
    return apiError("Lỗi tạo cơ sở định biên", 500)
  }
}
