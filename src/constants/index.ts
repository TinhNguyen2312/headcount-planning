import type { PermissionGroup } from "@/types"

export * from "./menu"

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
  role?: { shortCode?: string | null; name?: string | null } | string | null,
): PermissionGroup | undefined => {
  if (!role) return undefined
  if (typeof role === "string") return ROLE_GROUP_BY_SHORT_CODE[role]
  return (
    (role.name ? ROLE_GROUP_BY_SHORT_CODE[role.name] : undefined) ||
    (role.shortCode ? ROLE_GROUP_BY_SHORT_CODE[role.shortCode] : undefined)
  )
}
