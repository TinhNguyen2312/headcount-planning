import { NextRequest } from "next/server"
import { ilike, or, count, desc, asc, eq, and, type SQL } from "drizzle-orm"
import { db, roles, departments } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess, createPaginationMeta } from "@/lib/apiResponse"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const keyword = searchParams.get("keyword") || ""
    const departmentIdParam = searchParams.get("departmentId")
    const departmentId = departmentIdParam
      ? parseInt(departmentIdParam, 10)
      : undefined
    const parentRoleIdParam = searchParams.get("parentRoleId")
    const parentRoleId = parentRoleIdParam
      ? parseInt(parentRoleIdParam, 10)
      : undefined
    const planningMethod = searchParams.get("planningMethod")
    const page = parseInt(searchParams.get("page") || "0", 10)
    const limit = Math.min(
      200,
      parseInt(searchParams.get("limit") || "100", 10),
    )
    const order =
      searchParams.get("order")?.toLowerCase() === "asc" ? "asc" : "desc"

    const conditions: SQL[] = []
    if (departmentId !== undefined && !isNaN(departmentId))
      conditions.push(eq(roles.departmentId, departmentId))
    if (parentRoleId !== undefined && !isNaN(parentRoleId))
      conditions.push(eq(roles.parentRoleId, parentRoleId))
    if (planningMethod)
      conditions.push(eq(roles.planningMethod, planningMethod))
    if (keyword) {
      const kw = or(
        ilike(roles.name, `%${keyword}%`),
        ilike(roles.shortCode, `%${keyword}%`),
        ilike(roles.code, `%${keyword}%`),
      )
      if (kw) conditions.push(kw)
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(roles)
      .where(whereClause)

    const rows = await db
      .select({
        id: roles.id,
        code: roles.code,
        shortCode: roles.shortCode,
        name: roles.name,
        level: roles.level,
        parentRoleId: roles.parentRoleId,
        departmentId: roles.departmentId,
        planningMethod: roles.planningMethod,
        description: roles.description,
        createdAt: roles.createdAt,
      })
      .from(roles)
      .where(whereClause)
      .orderBy(order === "asc" ? asc(roles.id) : desc(roles.id))
      .offset(page * limit)
      .limit(limit)

    return apiSuccess(
      rows,
      "Thành công",
      createPaginationMeta(page, limit, Number(total)),
    )
  } catch (error) {
    console.error("Get roles error:", error)
    return apiError("Lỗi lấy danh sách chức danh", 500)
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
      shortCode,
      level,
      parentRoleId,
      departmentId,
      planningMethod,
      description,
    } = body

    if (!name || !name.trim())
      return apiError("Tên chức danh không được để trống", 422)

    if (code && code.trim()) {
      const [existing] = await db
        .select()
        .from(roles)
        .where(eq(roles.code, code.trim()))
      if (existing) return apiError("Mã chức danh đã tồn tại", 409)
    }

    const [created] = await db
      .insert(roles)
      .values({
        name: name.trim(),
        code: code ? code.trim() : null,
        shortCode: shortCode ? shortCode.trim() : null,
        level: level || 1,
        parentRoleId: parentRoleId || null,
        departmentId: departmentId || null,
        planningMethod: planningMethod || "BY_PROJECT",
        description: description || null,
      })
      .returning()

    return apiSuccess(created, "Tạo chức danh thành công")
  } catch (error) {
    console.error("Create role error:", error)
    return apiError("Lỗi tạo chức danh", 500)
  }
}
