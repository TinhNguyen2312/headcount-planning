export type PlanningMethod = "BY_SECTOR" | "BY_REGION" | "BY_PROJECT"

export const PLANNING_METHOD_OPTIONS: {
  value: PlanningMethod
  label: string
  description: string
}[] = [
  {
    value: "BY_PROJECT",
    label: "Theo Dự án",
    description: "Nhân sự chỉ được gán cho 1 dự án riêng biệt",
  },
  {
    value: "BY_REGION",
    label: "Theo Vùng",
    description: "Nhân sự phụ trách chung cho các dự án trong cùng 1 Vùng",
  },
  {
    value: "BY_SECTOR",
    label: "Theo Khu vực",
    description: "Nhân sự phụ trách chung cho các dự án trong cùng 1 Khu vực",
  },
]

export interface RoleResponse {
  id: number
  code: string | null
  shortCode: string | null
  name: string
  level?: number
  parentRoleId: number | null
  departmentId: number | null
  departmentName?: string | null
  departmentCode?: string | null
  departmentType?: string | null
  departmentLevel?: number | null
  departmentParentId?: number | null
  departmentMetadata?: unknown
  planningMethod?: PlanningMethod | null
  leadTimeMonths?: number | null
  description: string | null
  isActive?: boolean
  createdBy?: number
  createdAt: string
  updatedAt?: string | null
}

export interface RoleTreeNodeResponse extends RoleResponse {
  children: RoleTreeNodeResponse[]
}

export interface RoleCreate {
  name: string
  code: string
  shortCode?: string | null
  level: number
  parentRoleId?: number | null
  departmentId?: number | null
  planningMethod?: PlanningMethod | null
  leadTimeMonths?: number | null
  description?: string | null
  isActive?: boolean
}

export interface RoleUpdate {
  name?: string
  code?: string | null
  shortCode?: string | null
  level?: number
  parentRoleId?: number | null
  departmentId?: number | null
  planningMethod?: PlanningMethod | null
  leadTimeMonths?: number | null
  description?: string | null
  isActive?: boolean
}

export interface RoleQueryParams {
  departmentId?: number
  parentRoleId?: number
  keyword?: string
  page?: number
  limit?: number
  sortBy?: string
  order?: string
  isActive?: boolean
}
