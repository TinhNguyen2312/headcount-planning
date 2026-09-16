import type { DevelopmentType, ProjectType } from "./project"

export type PropertyDataType = "NUMBER" | "STRING" | "BOOLEAN" | "SELECT"

export type PropertyScope = ProjectType

export const PROPERTY_PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  ALL: "Chung toàn dự án",
  MIXED: "Áp dụng cho Thấp tầng và Cao tầng",
  LOW_RISE: "Chỉ áp dụng Thấp tầng",
  HIGH_RISE: "Chỉ áp dụng Cao tầng",
}

export const PROPERTY_PROJECT_TYPE_OPTIONS: {
  value: ProjectType
  label: string
}[] = [
  { value: "ALL", label: "Chung toàn dự án" },
  { value: "LOW_RISE", label: "Chỉ áp dụng Thấp tầng" },
  { value: "HIGH_RISE", label: "Chỉ áp dụng Cao tầng" },
  { value: "MIXED", label: "Áp dụng cho Thấp tầng và Cao tầng" },
]

export const PROPERTY_SCOPE_LABELS = PROPERTY_PROJECT_TYPE_LABELS
export const PROPERTY_SCOPE_OPTIONS = PROPERTY_PROJECT_TYPE_OPTIONS

export interface PropertyQueryParams {
  keyword?: string
  dataType?: PropertyDataType
  projectType?: ProjectType
  scope?: any
  isActive?: boolean | string
  /** Lọc theo phòng ban — chỉ trả về properties đã gán cho dept này HOẶC chưa gán dept nào */
  departmentId?: number | string
  page?: number
  limit?: number
  order?: "ASC" | "DESC" | string
}

export interface PropertyResponse {
  id: number
  code: string
  name: string
  dataType: PropertyDataType
  projectType: ProjectType
  scope?: any
  unit?: string | null
  options?: string[] | null
  description?: string | null
  isActive: boolean
  departmentIds: number[]
  departments?: PropertyDepartmentItem[]
  createdAt: string
  updatedAt: string
}

export interface PropertyCreate {
  code: string
  name: string
  dataType: PropertyDataType
  projectType?: ProjectType
  scope?: any
  unit?: string | null
  options?: string[] | null
  description?: string | null
  isActive?: boolean
  /** Danh sách ID phòng ban muốn gán (không truyền = không giới hạn phòng ban) */
  departmentIds?: number[]
}

export interface PropertyUpdate extends Partial<PropertyCreate> {}

/** Thông tin phòng ban gán cho property (từ bảng junction property_departments) */
export interface PropertyDepartmentItem {
  departmentId: number
  departmentCode: string
  departmentName: string
}

export interface PropertyValueItem {
  id?: number
  projectId: number
  propertyId: number
  projectType: string
  propertyCode: string
  propertyName: string
  dataType: PropertyDataType
  unit?: string | null
  options?: string[] | null
  valueText?: string | null
  valueNumber?: number | null
  updatedAt?: string
}

export interface ProjectPropertiesMatrixResponse {
  projectId: number
  projectType: ProjectType
  projectTypes?: ProjectType[]
  properties: PropertyResponse[]
  values: PropertyValueItem[]
}

export interface SaveProjectPropertiesPayload {
  values: Array<{
    propertyId: number
    projectType: string
    valueNumber?: number | null
    valueText?: string | null
  }>
}
