/**
 * Danh mục định nghĩa Resource (Tài nguyên) trong hệ thống
 */
export const RESOURCES = {
  PROJECT: "project",
  PLAN: "plan",
  HEADCOUNT_STANDARD: "headcount.standard",
  CATALOG: "catalog",
  USER: "user",
  ACCESS_ROLE: "access.role",
} as const

export type Resource = typeof RESOURCES[keyof typeof RESOURCES]

/**
 * Danh mục định nghĩa Action (Thao tác / Hành động) trong hệ thống
 */
export const ACTIONS = {
  VIEW: "view",
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  APPROVE: "approve",
  ARCHIVE: "archive",
  MANAGE: "manage",
} as const

export type Action = typeof ACTIONS[keyof typeof ACTIONS]

/**
 * Danh mục chuẩn hoá Permissions (Resource + Action)
 * Đảm bảo Type-safety và Autocomplete IntelliSense cho lập trình viên
 */
export const PERMISSIONS = {
  // 1. Quản lý Dự án (PROJECT scope)
  PROJECT_VIEW: `${RESOURCES.PROJECT}.${ACTIONS.VIEW}`,
  PROJECT_UPDATE: `${RESOURCES.PROJECT}.${ACTIONS.UPDATE}`,
  PROJECT_DELETE: `${RESOURCES.PROJECT}.${ACTIONS.DELETE}`,
  PROJECT_ASSIGNMENT_MANAGE: `${RESOURCES.PROJECT}.assignment.${ACTIONS.MANAGE}`,

  // 2. Dự án (GLOBAL scope)
  PROJECT_CREATE: `${RESOURCES.PROJECT}.${ACTIONS.CREATE}`,

  // 3. Kế hoạch định biên (PROJECT scope)
  PLAN_VIEW: `${RESOURCES.PLAN}.${ACTIONS.VIEW}`,
  PLAN_CREATE: `${RESOURCES.PLAN}.${ACTIONS.CREATE}`,
  PLAN_UPDATE: `${RESOURCES.PLAN}.${ACTIONS.UPDATE}`,
  PLAN_APPROVE: `${RESOURCES.PLAN}.${ACTIONS.APPROVE}`,
  PLAN_ARCHIVE: `${RESOURCES.PLAN}.${ACTIONS.ARCHIVE}`,

  // 4. Quản lý toàn cục (GLOBAL scope)
  HEADCOUNT_STANDARD_MANAGE: `${RESOURCES.HEADCOUNT_STANDARD}.${ACTIONS.MANAGE}`,
  CATALOG_MANAGE: `${RESOURCES.CATALOG}.${ACTIONS.MANAGE}`,
  USER_VIEW: `${RESOURCES.USER}.${ACTIONS.VIEW}`,
  USER_MANAGE: `${RESOURCES.USER}.${ACTIONS.MANAGE}`,
  ACCESS_ROLE_MANAGE: `${RESOURCES.ACCESS_ROLE}.${ACTIONS.MANAGE}`,
} as const

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS]

/**
 * Helper ghép nối linh hoạt Resource và Action
 */
export function buildPermission(resource: Resource, action: Action): string {
  return `${resource}.${action}`
}
