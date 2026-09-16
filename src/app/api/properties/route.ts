import { NextRequest } from "next/server"
import {
  ilike,
  or,
  and,
  count,
  desc,
  asc,
  eq,
  inArray,
  type SQL,
  notExists,
} from "drizzle-orm"
import { db, properties, propertyDepartments, departments } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess, createPaginationMeta } from "@/lib/apiResponse"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

/** Helper: lấy departmentIds đã gán cho danh sách properties */
async function getPropertyDeptMap(
  propertyIds: number[],
): Promise<
  Map<
    number,
    { departmentId: number; departmentCode: string; departmentName: string }[]
  >
> {
  if (propertyIds.length === 0) return new Map()

  const rows = await db
    .select({
      propertyId: propertyDepartments.propertyId,
      departmentId: propertyDepartments.departmentId,
      departmentCode: departments.code,
      departmentName: departments.name,
    })
    .from(propertyDepartments)
    .innerJoin(
      departments,
      eq(propertyDepartments.departmentId, departments.id),
    )
    .where(inArray(propertyDepartments.propertyId, propertyIds))

  const map = new Map<
    number,
    { departmentId: number; departmentCode: string; departmentName: string }[]
  >()
  for (const row of rows) {
    const list = map.get(row.propertyId) ?? []
    list.push({
      departmentId: row.departmentId,
      departmentCode: row.departmentCode ?? "",
      departmentName: row.departmentName,
    })
    map.set(row.propertyId, list)
  }
  return map
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const keyword = searchParams.get("keyword") || ""
    const dataType = searchParams.get("dataType") || ""
    const isActiveParam = searchParams.get("isActive")
    const departmentIdParam = searchParams.get("departmentId")
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

    // Filter theo department:
    // Trả về properties mà EITHER:
    //   (a) đã gán department đó, HOẶC
    //   (b) chưa gán department nào (không có row nào trong property_departments)
    if (departmentIdParam) {
      const deptId = parseInt(departmentIdParam, 10)
      if (!isNaN(deptId)) {
        const deptFilter = or(
          // (a) Có gán đúng department này
          inArray(
            properties.id,
            db
              .select({ id: propertyDepartments.propertyId })
              .from(propertyDepartments)
              .where(eq(propertyDepartments.departmentId, deptId)),
          ),
          // (b) Chưa gán bất kỳ department nào
          notExists(
            db
              .select({ id: propertyDepartments.propertyId })
              .from(propertyDepartments)
              .where(eq(propertyDepartments.propertyId, properties.id)),
          ),
        )
        if (deptFilter) conditions.push(deptFilter)
      }
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

    // Attach departmentIds vào mỗi item
    const deptMap = await getPropertyDeptMap(items.map((i) => i.id))
    const result = items.map((item) => ({
      ...item,
      departmentIds: (deptMap.get(item.id) ?? []).map((d) => d.departmentId),
      departments: deptMap.get(item.id) ?? [],
    }))

    return apiSuccess(
      result,
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
      departmentIds = [],
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

    // Gán departments nếu có
    if (Array.isArray(departmentIds) && departmentIds.length > 0) {
      const validIds = departmentIds.filter(
        (id): id is number => typeof id === "number" && !isNaN(id),
      )
      if (validIds.length > 0) {
        await db.insert(propertyDepartments).values(
          validIds.map((deptId) => ({
            propertyId: created.id,
            departmentId: deptId,
          })),
        )
      }
    }

    return apiSuccess(
      { ...created, departmentIds: departmentIds ?? [], departments: [] },
      "Tạo cơ sở định biên thành công",
    )
  } catch (error) {
    console.error("Create property error:", error)
    return apiError("Lỗi tạo cơ sở định biên", 500)
  }
}
