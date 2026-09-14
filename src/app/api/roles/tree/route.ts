import { NextRequest } from "next/server"
import { asc, eq } from "drizzle-orm"
import { db, roles, departments } from "@/db"
import { apiError, apiSuccess } from "@/lib/apiResponse"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const departmentIdParam = searchParams.get("departmentId")
    const departmentId = departmentIdParam
      ? parseInt(departmentIdParam, 10)
      : undefined

    const all = await db
      .select({
        id: roles.id,
        code: roles.code,
        shortCode: roles.shortCode,
        name: roles.name,
        level: roles.level,
        parentRoleId: roles.parentRoleId,
        departmentId: roles.departmentId,
        departmentName: departments.name,
        departmentCode: departments.code,
        departmentType: departments.type,
        departmentLevel: departments.level,
        departmentParentId: departments.parentId,
        departmentMetadata: departments.metadata,
        planningMethod: roles.planningMethod,
        leadTimeMonths: roles.leadTimeMonths,
        description: roles.description,
        createdAt: roles.createdAt,
      })
      .from(roles)
      .leftJoin(departments, eq(roles.departmentId, departments.id))
      .where(departmentId ? eq(roles.departmentId, departmentId) : undefined)
      .orderBy(asc(roles.level), asc(roles.name))

    const map = new Map<number, any>()
    const roots: any[] = []

    for (const r of all) {
      map.set(r.id, { ...r, children: [] })
    }

    for (const r of all) {
      const node = map.get(r.id)!
      if (r.parentRoleId && map.has(r.parentRoleId)) {
        map.get(r.parentRoleId)!.children.push(node)
      } else {
        roots.push(node)
      }
    }

    return apiSuccess(roots)
  } catch (error) {
    console.error("Get role tree error:", error)
    return apiError("Lỗi lấy cây chức danh", 500)
  }
}
