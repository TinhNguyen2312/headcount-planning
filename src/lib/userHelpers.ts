import { eq, and, inArray } from "drizzle-orm"
import { db, userProjects, projects, roles, departments, users } from "@/db"
import { resolvePermissionGroup } from "./permissionGroups"

export interface ProjectRoleSummary {
  projectId: number
  projectName: string
  roleId: number
  roleName: string
  projectRole: string
  departmentId: number | null
  departmentName: string | null
  userProjectRoleId: number
}

export async function getUserProjectSummaries(
  userId: number,
): Promise<ProjectRoleSummary[]> {
  const rows = await db
    .select({
      id: userProjects.id,
      projectId: projects.id,
      projectName: projects.name,
      roleId: roles.id,
      roleName: roles.name,
      shortCode: roles.shortCode,
      departmentId: departments.id,
      departmentName: departments.name,
    })
    .from(userProjects)
    .innerJoin(projects, eq(userProjects.projectId, projects.id))
    .innerJoin(roles, eq(userProjects.roleId, roles.id))
    .leftJoin(departments, eq(roles.departmentId, departments.id))
    .where(
      and(eq(userProjects.userId, userId), eq(userProjects.status, "ACTIVE")),
    )

  return rows.map((r) => ({
    projectId: r.projectId,
    projectName: r.projectName,
    roleId: r.roleId,
    roleName: r.roleName,
    projectRole: resolvePermissionGroup(r.shortCode),
    departmentId: r.departmentId,
    departmentName: r.departmentName,
    userProjectRoleId: r.id,
  }))
}

export async function formatUserResponse(user: typeof users.$inferSelect) {
  let roleName: string | null = null
  if (user.roleId) {
    const [r] = await db.select().from(roles).where(eq(roles.id, user.roleId))
    if (r) roleName = r.name
  }

  let managerName: string | null = null
  if (user.managerPerNumber) {
    const [mgr] = await db
      .select()
      .from(users)
      .where(eq(users.perNumber, user.managerPerNumber))
    if (mgr) managerName = mgr.fullName
  }

  const projectList = await getUserProjectSummaries(user.id)

  return {
    id: user.id,
    fullName: user.fullName,
    phone: user.phone,
    email: user.email,
    status: user.status,
    roleId: user.roleId,
    systemRole: user.systemRole,
    perNumber: user.perNumber,
    novatorStatus: user.novatorStatus,
    departmentCode: user.departmentCode,
    divisionCode: user.divisionCode,
    managerPerNumber: user.managerPerNumber,
    provider: user.provider,
    azureOid: user.azureOid,
    lastLoginAt: user.lastLoginAt,
    updatedAt: user.updatedAt,
    createdAt: user.createdAt,
    roleName,
    managerName,
    projects: projectList,
  }
}
