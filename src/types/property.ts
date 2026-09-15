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
}

export interface PropertyUpdate extends Partial<PropertyCreate> {}

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
