import { eq } from "drizzle-orm"
import { db, userProjects, projects, roles, departments, users } from "@/db"
import { resolvePermissionGroup } from "./permissionGroups"

export async function getDetailedUserProjectRole(uprId: number) {
  const [row] = await db
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
    .where(eq(userProjects.id, uprId))

  if (!row) return null

  let replacementUserName: string | null = null
  let replacementUserPerNumber: string | null = null
  if (row.replacementUserId) {
    const [rep] = await db
      .select()
      .from(users)
      .where(eq(users.id, row.replacementUserId))
    if (rep) {
      replacementUserName = rep.fullName
      replacementUserPerNumber = rep.perNumber
    }
  }

  return {
    ...row,
    projectRole: resolvePermissionGroup(row.shortCode),
    replacementUserName,
    replacementUserPerNumber,
  }
}
