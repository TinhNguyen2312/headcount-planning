import { NextRequest } from "next/server"
import { count, desc, asc, eq, and, type SQL } from "drizzle-orm"
import { db, userProjects, projects, roles, departments, users } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess, createPaginationMeta } from "@/lib/apiResponse"
import {
  getDetailedUserProjectRole,
  validateUserProjectAssignment,
} from "@/lib/userProjectHelpers"
import { resolvePermissionGroup } from "@/lib/permissionGroups"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
      ? parseInt(searchParams.get("userId")!, 10)
      : undefined
    const projectId = searchParams.get("projectId")
      ? parseInt(searchParams.get("projectId")!, 10)
      : undefined
    const roleId = searchParams.get("roleId")
      ? parseInt(searchParams.get("roleId")!, 10)
      : undefined
    const status = searchParams.get("status") || undefined
    const page = parseInt(searchParams.get("page") || "0", 10)
    const limit = Math.min(
      200,
      parseInt(searchParams.get("limit") || "100", 10),
    )
    const order =
      searchParams.get("order")?.toLowerCase() === "asc" ? "asc" : "desc"

    const conditions: SQL[] = []
    if (userId !== undefined && !isNaN(userId))
      conditions.push(eq(userProjects.userId, userId))
    if (projectId !== undefined && !isNaN(projectId))
      conditions.push(eq(userProjects.projectId, projectId))
    if (roleId !== undefined && !isNaN(roleId))
      conditions.push(eq(userProjects.roleId, roleId))
    if (status) conditions.push(eq(userProjects.status, status))

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(userProjects)
      .where(whereClause)

    const rows = await db
      .select({
        id: userProjects.id,
        userId: userProjects.userId,
        projectId: userProjects.projectId,
        roleId: userProjects.roleId,
        isPrimary: userProjects.isPrimary,
        effectiveFrom: userProjects.effectiveFrom,
        effectiveTo: userProjects.effectiveTo,
        status: userProjects.status,
        replacementUserId: userProjects.replacementUserId,
        replacementFrom: userProjects.replacementFrom,
        replacementTo: userProjects.replacementTo,
        createdAt: userProjects.createdAt,
        projectName: projects.name,
        roleName: roles.name,
        shortCode: roles.shortCode,
        departmentId: roles.departmentId,
        departmentName: departments.name,
        userFullName: users.fullName,
        userEmail: users.email,
        userPerNumber: users.perNumber,
      })
      .from(userProjects)
      .leftJoin(projects, eq(userProjects.projectId, projects.id))
      .leftJoin(roles, eq(userProjects.roleId, roles.id))
      .leftJoin(departments, eq(roles.departmentId, departments.id))
      .leftJoin(users, eq(userProjects.userId, users.id))
      .where(whereClause)
      .orderBy(order === "asc" ? asc(userProjects.id) : desc(userProjects.id))
      .offset(page * limit)
      .limit(limit)

    const results = await Promise.all(
      rows.map(async (row) => {
        let repName: string | null = null
        let repPer: string | null = null
        if (row.replacementUserId) {
          const [rep] = await db
            .select()
            .from(users)
            .where(eq(users.id, row.replacementUserId))
          if (rep) {
            repName = rep.fullName
            repPer = rep.perNumber
          }
        }
        return {
          ...row,
          projectRole: resolvePermissionGroup(row.shortCode),
          replacementUserName: repName,
          replacementUserPerNumber: repPer,
        }
      }),
    )

    return apiSuccess(
      results,
      "Thành công",
      createPaginationMeta(page, limit, Number(total)),
    )
  } catch (error) {
    console.error("Get user project roles error:", error)
    return apiError("Lỗi lấy danh sách phân quyền dự án", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const currentUser = await getCurrentUserFromSession(sessionId)
    if (!currentUser) return apiError("Chưa đăng nhập", 401, 401)

    const body = await req.json()
    const {
      userId,
      projectId,
      roleId,
      isPrimary,
      effectiveFrom,
      effectiveTo,
      status,
    } = body

    if (!userId) return apiError("Nhân sự không được để trống", 422)
    if (!projectId) return apiError("Dự án không được để trống", 422)
    if (!roleId) return apiError("Chức danh không được để trống", 422)

    // Kiểm tra ràng buộc phân bổ theo phương thức định biên (BRD 4.2.b)
    const validation = await validateUserProjectAssignment({
      userId,
      projectId,
      roleId,
      status: status || "ACTIVE",
    })
    if (!validation.valid) {
      return apiError(validation.error || "Phân công không hợp lệ", 422, 422)
    }

    const [created] = await db
      .insert(userProjects)
      .values({
        userId,
        projectId,
        roleId,
        isPrimary: isPrimary !== undefined ? isPrimary : true,
        effectiveFrom: effectiveFrom || new Date().toISOString().split("T")[0],
        effectiveTo: effectiveTo || null,
        status: status || "ACTIVE",
      })
      .returning()

    const detail = await getDetailedUserProjectRole(created.id)
    return apiSuccess(detail, "Tạo phân công dự án thành công")
  } catch (error) {
    console.error("Create user project role error:", error)
    return apiError("Lỗi tạo phân công dự án", 500)
  }
}
