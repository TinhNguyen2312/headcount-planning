export type PropertyDataType = "NUMBER" | "STRING" | "BOOLEAN" | "SELECT"

export interface PropertyQueryParams {
  keyword?: string
  dataType?: PropertyDataType
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
  properties: PropertyResponse[]
  values: PropertyValueItem[]
}

export interface SaveProjectPropertiesPayload {
  values: Array<{
    propertyId: number
    valueNumber?: number | null
    valueText?: string | null
  }>
}
