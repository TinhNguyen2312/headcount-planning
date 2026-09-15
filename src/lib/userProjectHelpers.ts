import { and, eq, ne } from "drizzle-orm"
import {
  db,
  departments,
  projects,
  regions,
  roles,
  sectors,
  userProjects,
  users,
} from "@/db"
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

export interface ValidateUserProjectAssignmentParams {
  userId: number
  projectId: number
  roleId: number
  currentAssignmentId?: number
  status?: string
}

export interface ValidationResult {
  valid: boolean
  error?: string
}

export async function validateUserProjectAssignment({
  userId,
  projectId,
  roleId,
  currentAssignmentId,
  status = "ACTIVE",
}: ValidateUserProjectAssignmentParams): Promise<ValidationResult> {
  // Phân công không phải ACTIVE (ví dụ ENDED) không tham gia ràng buộc vi phạm
  if (status !== "ACTIVE") {
    return { valid: true }
  }

  // 1. Lấy thông tin chức danh mới
  const [role] = await db
    .select({
      id: roles.id,
      name: roles.name,
      planningMethod: roles.planningMethod,
    })
    .from(roles)
    .where(eq(roles.id, roleId))
    .limit(1)

  if (!role) {
    return { valid: false, error: "Chức danh không tồn tại trong hệ thống" }
  }

  const planningMethod = role.planningMethod || "BY_PROJECT"

  // 2. Lấy thông tin dự án mới (kèm Vùng & Khu vực)
  const [targetProj] = await db
    .select({
      id: projects.id,
      name: projects.name,
      regionId: projects.regionId,
      regionName: regions.name,
      sectorId: regions.sectorId,
      sectorName: sectors.name,
    })
    .from(projects)
    .leftJoin(regions, eq(projects.regionId, regions.id))
    .leftJoin(sectors, eq(regions.sectorId, sectors.id))
    .where(eq(projects.id, projectId))
    .limit(1)

  if (!targetProj) {
    return { valid: false, error: "Dự án không tồn tại trong hệ thống" }
  }

  // 3. Lấy tất cả phân công đang ACTIVE của nhân sự (trừ bản ghi hiện tại nếu đang PATCH)
  const whereConditions = [
    eq(userProjects.userId, userId),
    eq(userProjects.status, "ACTIVE"),
  ]
  if (currentAssignmentId) {
    whereConditions.push(ne(userProjects.id, currentAssignmentId))
  }

  const activeAssignments = await db
    .select({
      id: userProjects.id,
      projectId: userProjects.projectId,
      projectName: projects.name,
      roleId: userProjects.roleId,
      roleName: roles.name,
      planningMethod: roles.planningMethod,
      regionId: projects.regionId,
      regionName: regions.name,
      sectorId: regions.sectorId,
      sectorName: sectors.name,
    })
    .from(userProjects)
    .innerJoin(projects, eq(userProjects.projectId, projects.id))
    .innerJoin(roles, eq(userProjects.roleId, roles.id))
    .leftJoin(regions, eq(projects.regionId, regions.id))
    .leftJoin(sectors, eq(regions.sectorId, sectors.id))
    .where(and(...whereConditions))

  // Nếu nhân sự chưa có phân công active nào khác thì hợp lệ
  if (activeAssignments.length === 0) {
    return { valid: true }
  }

  // Quy tắc 1: Nếu chức danh mới là BY_PROJECT, nhân sự không được phép phụ trách dự án khác
  if (planningMethod === "BY_PROJECT") {
    const otherProjectAssignment = activeAssignments.find(
      (a) => a.projectId !== targetProj.id,
    )
    if (otherProjectAssignment) {
      return {
        valid: false,
        error: `Chức danh '${role.name}' có phương thức định biên theo Dự án (BY_PROJECT). Nhân sự hiện đang phụ trách dự án '${otherProjectAssignment.projectName}', không thể phân công thêm dự án khác.`,
      }
    }
  }

  // Quy tắc 2: Nếu nhân sự ĐANG giữ một vai trò BY_PROJECT ở một dự án khác, không thể gán thêm dự án mới
  const existingByProject = activeAssignments.find(
    (a) =>
      (a.planningMethod || "BY_PROJECT") === "BY_PROJECT" &&
      a.projectId !== targetProj.id,
  )
  if (existingByProject) {
    return {
      valid: false,
      error: `Nhân sự hiện đang đảm nhiệm chức danh theo Dự án (BY_PROJECT) '${existingByProject.roleName}' tại dự án '${existingByProject.projectName}'. Không thể phân công thêm dự án khác.`,
    }
  }

  // Quy tắc 3: Nếu chức danh mới là BY_REGION, tất cả các dự án active phải cùng 1 Vùng
  if (planningMethod === "BY_REGION") {
    if (!targetProj.regionId) {
      return {
        valid: false,
        error: `Dự án '${targetProj.name}' chưa được cấu hình Vùng (Region). Không thể phân công chức danh theo Vùng.`,
      }
    }

    for (const a of activeAssignments) {
      if (a.regionId && a.regionId !== targetProj.regionId) {
        return {
          valid: false,
          error: `Chức danh '${role.name}' có phương thức định biên theo Vùng (BY_REGION). Nhân sự hiện đang phụ trách dự án '${a.projectName}' thuộc '${a.regionName || "Vùng khác"}', không thể phân công vào dự án '${targetProj.name}' thuộc '${targetProj.regionName || "Vùng khác"}'.`,
        }
      }
    }
  }

  // Quy tắc 4: Nếu chức danh mới là BY_SECTOR, tất cả các dự án active phải cùng 1 Khu vực
  if (planningMethod === "BY_SECTOR") {
    if (!targetProj.sectorId) {
      return {
        valid: false,
        error: `Dự án '${targetProj.name}' chưa được cấu hình Khu vực (Sector). Không thể phân công chức danh theo Khu vực.`,
      }
    }

    for (const a of activeAssignments) {
      if (a.sectorId && a.sectorId !== targetProj.sectorId) {
        return {
          valid: false,
          error: `Chức danh '${role.name}' có phương thức định biên theo Khu vực (BY_SECTOR). Nhân sự hiện đang phụ trách dự án '${a.projectName}' thuộc '${a.sectorName || "Khu vực khác"}', không thể phân công vào dự án '${targetProj.name}' thuộc '${targetProj.sectorName || "Khu vực khác"}'.`,
        }
      }
    }
  }

  return { valid: true }
}
