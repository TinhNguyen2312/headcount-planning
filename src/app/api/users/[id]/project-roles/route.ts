import { NextRequest } from "next/server"
import { eq, and } from "drizzle-orm"
import { db, userProjects, projects, roles, departments, users } from "@/db"
import { getCurrentUserFromSession } from "@/lib/session"
import { apiError, apiSuccess } from "@/lib/apiResponse"
import { getDetailedUserProjectRole } from "@/lib/userProjectHelpers"
import { resolvePermissionGroup } from "@/lib/permissionGroups"

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "JSESSIONID"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const userId = parseInt(id, 10)

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
      .where(eq(userProjects.userId, userId))

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

    return apiSuccess(results)
  } catch (error) {
    console.error("Get user project roles error:", error)
    return apiError("Lỗi lấy danh sách phân quyền dự án của nhân sự", 500)
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const currentUser = await getCurrentUserFromSession(sessionId)
    if (!currentUser) return apiError("Chưa đăng nhập", 401, 401)

    const { id } = await params
    const userId = parseInt(id, 10)
    const body = await req.json()
    const { projectId, roleId, isPrimary, effectiveFrom, effectiveTo, status } =
      body

    if (!projectId) return apiError("Dự án không được để trống", 422)
    if (!roleId) return apiError("Chức danh không được để trống", 422)

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
    return apiSuccess(detail, "Phân quyền dự án thành công")
  } catch (error) {
    console.error("Assign project role error:", error)
    return apiError("Lỗi phân quyền dự án cho nhân sự", 500)
  }
}
