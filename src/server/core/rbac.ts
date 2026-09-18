import { and, eq, gte, inArray, isNull, lte, or, sql } from "drizzle-orm"
import {
  accessRolePermissions,
  accessRoles,
  db,
  permissions,
  userAccessRoles,
  userProjects,
} from "@/db"
import { BadRequestError, ForbiddenError } from "./errors"
import type { PermissionKey } from "./permissions"

export type PermissionScope = "GLOBAL" | "PROJECT"

export interface ResolvedPermissions {
  isSuperAdmin: boolean
  globalPermissions: Set<string>
  projectPermissions: Set<string>
  allPermissions: Set<string>
  has: (permissionKey: PermissionKey | string) => boolean
}

/**
 * Lấy tất cả ID của Role và các Role tổ tiên (Cha, Ông, Cụ...) thông qua đệ quy (Hierarchical RBAC)
 */
export async function getRoleWithAncestorIds(
  roleIds: number[],
): Promise<number[]> {
  const validIds = roleIds.filter((id) => typeof id === "number" && !isNaN(id))
  if (validIds.length === 0) return []

  const idSqlList = sql.join(
    validIds.map((id) => sql`${id}`),
    sql`, `,
  )

  const query = sql`
    WITH RECURSIVE role_tree AS (
      SELECT id, parent_id FROM access_roles WHERE id IN (${idSqlList})
      UNION
      SELECT r.id, r.parent_id FROM access_roles r
      INNER JOIN role_tree rt ON r.id = rt.parent_id
    )
    SELECT DISTINCT id FROM role_tree
  `
  const result = await db.execute<{ id: number }>(query)
  return (result as unknown as Array<{ id: number }>).map((r) => Number(r.id))
}

/**
 * Trích xuất toàn bộ quyền (Global + Project) của một người dùng bao gồm kế thừa
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

  // 1. Lấy quyền GLOBAL (kèm tất cả Role cha kế thừa) từ user_access_roles
  const globalRoleRows = await db
    .select({ accessRoleId: userAccessRoles.accessRoleId })
    .from(userAccessRoles)
    .where(eq(userAccessRoles.userId, userId))

  const directGlobalRoleIds = globalRoleRows.map((r) => r.accessRoleId)
  const allGlobalRoleIds = await getRoleWithAncestorIds(directGlobalRoleIds)

  if (allGlobalRoleIds.length > 0) {
    const globalRows = await db
      .select({ key: permissions.key })
      .from(accessRolePermissions)
      .innerJoin(
        permissions,
        eq(accessRolePermissions.permissionId, permissions.id),
      )
      .where(inArray(accessRolePermissions.accessRoleId, allGlobalRoleIds))

    for (const row of globalRows) {
      globalPermissions.add(row.key)
    }
  }

  // 2. Nếu có projectId, lấy quyền PROJECT (kèm tất cả Role cha kế thừa) từ user_projects còn hiệu lực
  if (projectId) {
    const today = new Date().toISOString().split("T")[0]

    const projectRoleRows = await db
      .select({ accessRoleId: userProjects.accessRoleId })
      .from(userProjects)
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

    const directProjectRoleIds = projectRoleRows
      .map((r) => r.accessRoleId)
      .filter((id): id is number => id !== null && id !== undefined)

    const allProjectRoleIds = await getRoleWithAncestorIds(directProjectRoleIds)

    if (allProjectRoleIds.length > 0) {
      const projectRows = await db
        .select({ key: permissions.key })
        .from(accessRolePermissions)
        .innerJoin(
          permissions,
          eq(accessRolePermissions.permissionId, permissions.id),
        )
        .where(inArray(accessRolePermissions.accessRoleId, allProjectRoleIds))

      for (const row of projectRows) {
        projectPermissions.add(row.key)
      }
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
    has: (permissionKey: PermissionKey | string) => {
      if (allPermissions.has(permissionKey) || allPermissions.has("*")) {
        return true
      }
      const [resource] = permissionKey.split(".")
      if (resource && allPermissions.has(`${resource}.manage`)) {
        return true
      }
      if (allPermissions.has("catalog.manage")) {
        const catalogResources = ["department", "sector", "region", "role", "property", "catalog"]
        if (catalogResources.includes(resource)) {
          return true
        }
      }
      if (allPermissions.has("project.manage")) {
        const projectResources = ["project", "user_project", "milestone", "phase", "headcount_project"]
        if (projectResources.includes(resource)) {
          return true
        }
      }
      return false
    },
  }
}

/**
 * Kiểm tra xem user có quyền hay không, nếu không ném ForbiddenError
 */
export function checkPermission(
  perms: ResolvedPermissions,
  requiredPermission: PermissionKey | string,
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

/**
 * Validate nghiệp vụ Kế thừa:
 * 1. Role con và Role cha phải cùng phạm vi (scope).
 * 2. Không được tạo vòng lặp vô tận (Cycle detection).
 */
export async function validateRoleInheritance(
  roleId: number | null | undefined,
  roleScope: PermissionScope,
  parentId: number | null | undefined,
): Promise<void> {
  if (!parentId) return

  if (roleId && parentId === roleId) {
    throw new BadRequestError("Một vai trò không thể kế thừa chính nó")
  }

  // 1. Kiểm tra parentRole có tồn tại và cùng scope không
  const [parentRole] = await db
    .select({
      id: accessRoles.id,
      scope: accessRoles.scope,
      parentId: accessRoles.parentId,
    })
    .from(accessRoles)
    .where(eq(accessRoles.id, parentId))

  if (!parentRole) {
    throw new BadRequestError("Vai trò cha không tồn tại")
  }

  if (parentRole.scope !== roleScope) {
    throw new BadRequestError(
      `Vai trò phạm vi ${roleScope} chỉ có thể kế thừa từ vai trò cha có cùng phạm vi ${roleScope}`,
    )
  }

  // 2. Chống lặp chu trình (Cycle detection)
  if (roleId) {
    const ancestors = await getRoleWithAncestorIds([parentId])
    if (ancestors.includes(roleId)) {
      throw new BadRequestError(
        "Kế thừa không hợp lệ: Sẽ gây ra chu trình lặp vô tận giữa các vai trò (Cycle detected)",
      )
    }
  }
}
