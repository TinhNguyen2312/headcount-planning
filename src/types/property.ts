import type { DevelopmentType } from "./project"

export type PropertyDataType = "NUMBER" | "STRING" | "BOOLEAN" | "SELECT"

export type PropertyScope =
  | "COMMON"
  | "PER_TYPE"
  | "LOW_RISE_ONLY"
  | "HIGH_RISE_ONLY"

export const PROPERTY_SCOPE_LABELS: Record<PropertyScope, string> = {
  COMMON: "Chung toàn dự án",
  PER_TYPE: "Ap dụng riêng theo Thấp tầng / Cao tầng",
  LOW_RISE_ONLY: "Chỉ áp dụng Thấp tầng",
  HIGH_RISE_ONLY: "Chỉ áp dụng Cao tầng",
}

export const PROPERTY_SCOPE_OPTIONS: { value: PropertyScope; label: string }[] =
  [
    { value: "COMMON", label: "Chung toàn dự án" },
    {
      value: "PER_TYPE",
      label: "Áp dụng cho Thấp tầng và Cao tầng",
    },
    { value: "LOW_RISE_ONLY", label: "Chỉ áp dụng Thấp tầng" },
    { value: "HIGH_RISE_ONLY", label: "Chỉ áp dụng Cao tầng" },
  ]

export interface PropertyQueryParams {
  keyword?: string
  dataType?: PropertyDataType
  scope?: PropertyScope
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
  scope: PropertyScope
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
  scope?: PropertyScope
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
  scope?: PropertyScope
  unit?: string | null
  options?: string[] | null
  valueText?: string | null
  valueNumber?: number | null
  updatedAt?: string
}

export interface ProjectPropertiesMatrixResponse {
  projectId: number
  projectTypes: DevelopmentType[]
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
