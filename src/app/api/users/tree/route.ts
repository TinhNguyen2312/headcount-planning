import { NextRequest } from "next/server"
import { asc, eq, and, inArray, type SQL } from "drizzle-orm"
import { db, users, roles, userProjects } from "@/db"
import { apiError, apiSuccess } from "@/lib/apiResponse"
import { getUserProjectSummaries } from "@/lib/userHelpers"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || undefined
    const projectIdParam = searchParams.get("projectId")
    const projectId = projectIdParam ? parseInt(projectIdParam, 10) : undefined

    const conditions: SQL[] = []
    if (status) conditions.push(eq(users.status, status))

    if (projectId !== undefined && !isNaN(projectId)) {
      const upRows = await db
        .select({ userId: userProjects.userId })
        .from(userProjects)
        .where(
          and(
            eq(userProjects.projectId, projectId),
            eq(userProjects.status, "ACTIVE"),
          ),
        )
      const uids = upRows.map((u) => u.userId)
      if (uids.length > 0) {
        conditions.push(inArray(users.id, uids))
      } else {
        return apiSuccess([])
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const allUsers = await db
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(asc(users.perNumber), asc(users.fullName))

    const roleMap = new Map<number, string>()
    const allRoles = await db.select().from(roles)
    allRoles.forEach((r) => roleMap.set(r.id, r.name))

    const nodesByPer = new Map<string, any>()
    const allNodes: any[] = []

    for (const u of allUsers) {
      const pSummaries = await getUserProjectSummaries(u.id)
      const node = {
        id: u.id,
        fullName: u.fullName,
        phone: u.phone,
        email: u.email,
        status: u.status,
        roleId: u.roleId,
        systemRole: u.systemRole,
        perNumber: u.perNumber,
        novatorStatus: u.novatorStatus,
        departmentCode: u.departmentCode,
        divisionCode: u.divisionCode,
        managerPerNumber: u.managerPerNumber,
        provider: u.provider,
        azureOid: u.azureOid,
        lastLoginAt: u.lastLoginAt,
        updatedAt: u.updatedAt,
        createdAt: u.createdAt,
        roleName: u.roleId ? roleMap.get(u.roleId) || null : null,
        managerName: null,
        projects: pSummaries,
        children: [] as any[],
      }
      allNodes.push(node)
      if (u.perNumber) {
        nodesByPer.set(u.perNumber, node)
      }
    }

    const roots: any[] = []
    for (const node of allNodes) {
      let parent: any = null
      if (node.managerPerNumber && nodesByPer.has(node.managerPerNumber)) {
        const candidate = nodesByPer.get(node.managerPerNumber)
        if (candidate.id !== node.id) {
          parent = candidate
          node.managerName = candidate.fullName
        }
      }

      if (parent) {
        parent.children.push(node)
      } else {
        roots.push(node)
      }
    }

    return apiSuccess(roots)
  } catch (error) {
    console.error("Get user tree error:", error)
    return apiError("Lỗi lấy cây nhân sự", 500)
  }
}
