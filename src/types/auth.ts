export type ProjectRole =
  | "PROJECT_ADMIN"
  | "ZONE_ADMIN"
  | "TASK_INSPECTOR"
  | "TASK_EXECUTOR"
  | "VIEWER"

export type PermissionGroup = ProjectRole

export type SystemRole = "USER" | "SUPER_ADMIN"

export type UserStatus = "ACTIVE" | "INACTIVE" | "LOCKED"

export type AppRole = ProjectRole | "SUPER_ADMIN"

export type Permission =
  | "MANAGE_BUSINESS_MATRIX"
  | "MANAGE_TASK_CONFIG"
  | "MANAGE_CHECKLIST_TEMPLATES"
  | "MANAGE_STAFF_ACCOUNTS"
  | "VIEW_ALL_PROJECTS"
  | "MANAGE_ZONES"
  | "ASSIGN_STAFF_TO_PROJECT"
  | "RECEIVE_ESCALATION_HIGH"
  | "VIEW_PROJECT_DASHBOARD"
  | "APPROVE_LEVEL_1"
  | "APPROVE_LEVEL_2"
  | "REVIEW_EVIDENCE"
  | "RECEIVE_ESCALATION_MEDIUM"
  | "MANAGE_SCHEDULE"
  | "CONFIGURE_REPLACEMENT_STAFF"
  | "COPY_WEEK_SCHEDULE"
  | "CREATE_ADHOC_TASK"
  | "REJECT_WITH_REWORK"
  | "RECEIVE_ESCALATION_LOW"
  | "RECEIVE_DAILY_TASK"
  | "START_TASK"
  | "SUBMIT_EVIDENCE"
  | "FILL_CHECKLIST"
  | "RECEIVE_REWORK_TASK"
  | "VIEW_TASK_PROGRESS"
  | "EXPORT_REPORTS"

const OWN_PERMISSIONS: Record<AppRole, Permission[]> = {
  SUPER_ADMIN: [
    "MANAGE_BUSINESS_MATRIX",
    "MANAGE_TASK_CONFIG",
    "MANAGE_CHECKLIST_TEMPLATES",
    "MANAGE_STAFF_ACCOUNTS",
    "VIEW_ALL_PROJECTS",
  ],
  PROJECT_ADMIN: [
    "MANAGE_ZONES",
    "ASSIGN_STAFF_TO_PROJECT",
    "RECEIVE_ESCALATION_HIGH",
    "VIEW_PROJECT_DASHBOARD",
  ],
  ZONE_ADMIN: [
    "APPROVE_LEVEL_1",
    "APPROVE_LEVEL_2",
    "REVIEW_EVIDENCE",
    "RECEIVE_ESCALATION_MEDIUM",
    "RECEIVE_ESCALATION_HIGH",
  ],
  TASK_INSPECTOR: [
    "MANAGE_SCHEDULE",
    "CONFIGURE_REPLACEMENT_STAFF",
    "COPY_WEEK_SCHEDULE",
    "CREATE_ADHOC_TASK",
    "REVIEW_EVIDENCE",
    "APPROVE_LEVEL_1",
    "REJECT_WITH_REWORK",
    "RECEIVE_ESCALATION_LOW",
    "RECEIVE_ESCALATION_MEDIUM",
  ],
  TASK_EXECUTOR: [
    "RECEIVE_DAILY_TASK",
    "START_TASK",
    "SUBMIT_EVIDENCE",
    "FILL_CHECKLIST",
    "RECEIVE_REWORK_TASK",
    "CREATE_ADHOC_TASK",
  ],
  VIEWER: ["VIEW_TASK_PROGRESS", "EXPORT_REPORTS"],
}

const MANAGEMENT_CHAIN: AppRole[] = [
  "SUPER_ADMIN",
  "PROJECT_ADMIN",
  "ZONE_ADMIN",
  "TASK_INSPECTOR",
]

const unionDownwardChain = (role: AppRole): Permission[] => {
  const chainIndex = MANAGEMENT_CHAIN.indexOf(role)
  if (chainIndex === -1) return OWN_PERMISSIONS[role]

  const inherited = new Set<Permission>()
  MANAGEMENT_CHAIN.slice(chainIndex).forEach((chainRole) => {
    OWN_PERMISSIONS[chainRole].forEach((permission) => {
      inherited.add(permission)
    })
  })
  return Array.from(inherited)
}

export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  SUPER_ADMIN: unionDownwardChain("SUPER_ADMIN"),
  PROJECT_ADMIN: unionDownwardChain("PROJECT_ADMIN"),
  ZONE_ADMIN: unionDownwardChain("ZONE_ADMIN"),
  TASK_INSPECTOR: unionDownwardChain("TASK_INSPECTOR"),
  TASK_EXECUTOR: OWN_PERMISSIONS.TASK_EXECUTOR,
  VIEWER: OWN_PERMISSIONS.VIEWER,
}

export const hasPermission = (
  role: AppRole | null | undefined,
  permission: Permission,
): boolean => (role ? ROLE_PERMISSIONS[role].includes(permission) : false)

export const isSuperAdminUser = (
  user: { systemRole?: SystemRole } | null | undefined,
): boolean => user?.systemRole === "SUPER_ADMIN"

export interface LoginRequest {
  email: string
  password: string
}

export interface LocalLoginRequest {
  email: string
  password: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ResetPasswordRequest {
  newPassword: string
}

export interface UpdateRoleRequest {
  role: string
}

import type { UserMeResponse, UserResponse } from "./user"

export type LoginResponse = UserResponse | UserMeResponse
