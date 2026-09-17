import { and, eq, isNull, lte, or, gte, sql } from "drizzle-orm"
import {
  db,
  accessRolePermissions,
  permissions,
  userAccessRoles,
  userProjects,
  accessRoles,
} from "@/db"
import { BadRequestError, ForbiddenError } from "./errors"

export type PermissionScope = "GLOBAL" | "PROJECT"

export interface ResolvedPermissions {
  isSuperAdmin: boolean
  globalPermissions: Set<string>
  projectPermissions: Set<string>
  allPermissions: Set<string>
  has: (permissionKey: string) => boolean
}

/**
 * Trích xuất toàn bộ quyền (Global + Project) của một người dùng
 */
export async function resolveUserPermissions(
  userId: number,
  projectId?: number,
  systemRole?: string,
): Promise<ResolvedPermissions> {
  const isSuperAdmin = systemRole === "SUPER_ADMIN"

  if (isSuperAdmin) {
    return {
      isSuperAdmin: true,
      globalPermissions: new Set(["*"]),
      projectPermissions: new Set(["*"]),
      allPermissions: new Set(["*"]),
      has: () => true,
    }
  }

  const globalPermissions = new Set<string>()
  const projectPermissions = new Set<string>()

  // 1. Lấy quyền GLOBAL từ user_access_roles
  const globalRows = await db
    .select({
      key: permissions.key,
    })
    .from(userAccessRoles)
    .innerJoin(
      accessRolePermissions,
      eq(userAccessRoles.accessRoleId, accessRolePermissions.accessRoleId),
    )
    .innerJoin(
      permissions,
      eq(accessRolePermissions.permissionId, permissions.id),
    )
    .where(eq(userAccessRoles.userId, userId))

  for (const row of globalRows) {
    globalPermissions.add(row.key)
  }

  // 2. Nếu có projectId, lấy quyền PROJECT từ user_projects còn hiệu lực
  if (projectId) {
    const today = new Date().toISOString().split("T")[0]

    const projectRows = await db
      .select({
        key: permissions.key,
      })
      .from(userProjects)
      .innerJoin(
        accessRolePermissions,
        eq(userProjects.accessRoleId, accessRolePermissions.accessRoleId),
      )
      .innerJoin(
        permissions,
        eq(accessRolePermissions.permissionId, permissions.id),
      )
      .where(
        and(
          eq(userProjects.userId, userId),
          eq(userProjects.projectId, projectId),
          eq(userProjects.status, "ACTIVE"),
          lte(userProjects.effectiveFrom, today),
          or(
            isNull(userProjects.effectiveTo),
            gte(userProjects.effectiveTo, today),
          ),
        ),
      )

    for (const row of projectRows) {
      projectPermissions.add(row.key)
    }
  }

  const allPermissions = new Set([
    ...Array.from(globalPermissions),
    ...Array.from(projectPermissions),
  ])

  return {
    isSuperAdmin: false,
    globalPermissions,
    projectPermissions,
    allPermissions,
    has: (permissionKey: string) =>
      allPermissions.has(permissionKey) || allPermissions.has("*"),
  }
}

/**
 * Kiểm tra xem user có quyền hay không, nếu không ném ForbiddenError
 */
export function checkPermission(
  perms: ResolvedPermissions,
  requiredPermission: string,
): void {
  if (!perms.has(requiredPermission)) {
    throw new ForbiddenError(
      `Bạn không có quyền thực hiện hành động này (yêu cầu: ${requiredPermission})`,
    )
  }
}

/**
 * Validate nghiệp vụ: Một Access Role chỉ chứa các permissions cùng scope với nó
 */
export function validateRolePermissionsScope(
  roleScope: PermissionScope,
  permissionScopes: PermissionScope[],
): void {
  const invalid = permissionScopes.some((s) => s !== roleScope)
  if (invalid) {
    throw new BadRequestError(
      `Vai trò phạm vi ${roleScope} chỉ có thể chứa các quyền có cùng phạm vi ${roleScope}`,
    )
  }
}

/**
 * Validate nghiệp vụ: Access Role gán vào user_projects bắt buộc phải là PROJECT scope
 */
export function validateProjectRoleAssignment(accessRoleScope: string): void {
  if (accessRoleScope !== "PROJECT") {
    throw new BadRequestError(
      "Vai trò phân bổ trong dự án phải có phạm vi là PROJECT",
    )
  }
}

/**
 * Validate nghiệp vụ: Access Role gán vào user_access_roles bắt buộc phải là GLOBAL scope
 */
export function validateGlobalRoleAssignment(accessRoleScope: string): void {
  if (accessRoleScope !== "GLOBAL") {
    throw new BadRequestError(
      "Vai trò phân quyền hệ thống (toàn công ty) phải có phạm vi là GLOBAL",
    )
  }
}
