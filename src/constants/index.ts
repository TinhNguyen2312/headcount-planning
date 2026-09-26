import type {
  ApprovalLevel,
  EscalateLevel,
  PermissionGroup,
  RequirementType,
  RoleMetadata,
  TaskInstanceCategory,
  TaskType,
} from "@/types"

export * from "./menu"
export * from "./map"
export * from "./fileAdapter"
export * from "./sort"

export const TASK_INSTANCE_CATEGORY_LABEL: Record<
  TaskInstanceCategory,
  string
> = {
  DAILY: "Định kỳ",
  ADHOC: "Phát sinh",
}

export const TASK_INSTANCE_CATEGORY_COLOR: Record<
  TaskInstanceCategory,
  string
> = {
  DAILY: "cyan",
  ADHOC: "orange",
}

export const TASK_TYPE_LABEL: Record<TaskType, string> = {
  FREQUENCY: "Thường xuyên",
  ADHOC: "Đột xuất",
}

export const TASK_TYPE_COLOR: Record<TaskType, string> = {
  FREQUENCY: "blue",
  ADHOC: "orange",
}

export const APPROVAL_LEVEL_LABEL: Record<ApprovalLevel, string> = {
  0: "Đồng bộ từ ACC",
  1: "QLTT",
  2: "QLTT, QLTT+1",
}

export const ESCALATE_COLOR: Record<EscalateLevel, string> = {
  LOW: "default",
  MEDIUM: "warning",
  HIGH: "error",
}

export const ESCALATE_LABEL: Record<EscalateLevel, string> = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
}

export const REQUIREMENT_TYPE_LABEL: Record<RequirementType, string> = {
  FILE: "File",
  IMAGE: "Hình ảnh",
  VIDEO: "Video",
  DATA_ENTRY: "Nhập số liệu",
  CHECKBOX: "Checkbox",
  NUMBER: "Số liệu (Number)",
}

export const REQUIREMENT_TYPE_COLOR: Record<RequirementType, string> = {
  FILE: "blue",
  IMAGE: "green",
  VIDEO: "purple",
  DATA_ENTRY: "orange",
  CHECKBOX: "cyan",
  NUMBER: "magenta",
}

export const PROJECT_ROLE_OPTIONS: { value: PermissionGroup; label: string }[] =
  [
    { value: "PROJECT_ADMIN", label: "PROJECT_ADMIN" },
    { value: "ZONE_ADMIN", label: "ZONE_ADMIN" },
    { value: "TASK_INSPECTOR", label: "TASK_INSPECTOR" },
    {
      value: "TASK_EXECUTOR",
      label: "TASK_EXECUTOR",
    },
    { value: "VIEWER", label: "VIEWER" },
  ]

export const ROLE_GROUP_BY_SHORT_CODE: Record<string, PermissionGroup> = {
  "GĐ/PGĐ Phòng Quản lý Xây dựng, An toàn và Môi trường": "PROJECT_ADMIN",
  "Trưởng phòng Quản lý Xây dựng, An toàn và Môi trường": "ZONE_ADMIN",
  "Trưởng bộ phận Quản lý Xây dựng": "TASK_INSPECTOR",
  "Trưởng bộ phận Quản lý Cơ điện": "TASK_INSPECTOR",
  "Trưởng bộ phận Quản lý Hạ tầng kỹ thuật": "TASK_INSPECTOR",
  "Kỹ sư cao cấp Giám sát Xây dựng": "TASK_EXECUTOR",
  "Kỹ sư cao cấp Giám sát Cơ điện": "TASK_EXECUTOR",
  "Kỹ sư cao cấp Giám sát Hạ tầng kỹ thuật": "TASK_EXECUTOR",
  "Kiến trúc sư cao cấp Công trường": "TASK_EXECUTOR",
  "Kỹ sư cao cấp Kiểm soát Chất lượng và tiến độ": "TASK_EXECUTOR",
  "Kỹ sư cao cấp Kiểm soát Trắc đạc": "TASK_EXECUTOR",
  "Kỹ sư cao cấp Kiểm soát An toàn lao động": "TASK_EXECUTOR",
  "Kỹ sư cao cấp kiểm soát cây xanh": "TASK_EXECUTOR",
  "Thư ký Công trường": "VIEWER",
}

export const getRolePermissionGroup = (
  role?: { shortCode?: string | null; name?: string | null; metadata?: RoleMetadata | null } | string | null,
): PermissionGroup | undefined => {
  if (!role) return undefined
  if (typeof role === "string") return ROLE_GROUP_BY_SHORT_CODE[role]
  if (role.metadata?.projectRole) return role.metadata.projectRole as PermissionGroup
  return (
    (role.name ? ROLE_GROUP_BY_SHORT_CODE[role.name] : undefined) ||
    (role.shortCode ? ROLE_GROUP_BY_SHORT_CODE[role.shortCode] : undefined)
  )
}
