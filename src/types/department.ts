export interface DepartmentQueryParams {
  keyword?: string
  status?: string
  type?: string
  level?: number
  parentId?: number
  page?: number
  limit?: number
  sortBy?: string
  order?: "ASC" | "DESC" | string
}

export type DepartmentType =
  | "Khối"
  | "Ban"
  | "Phòng"
  | "Bộ phận"
  | "Nhóm"
  | "Department"
  | "Division"
  | "Team"
  | string

export interface DepartmentResponse {
  id: number
  code: string
  name: string
  type?: string
  level?: number
  parentId?: number | null
  status?: string // 'ACTIVE' | 'INACTIVE'
  description?: string | null
  startDate?: string | null
  endDate?: string | null
  path?: string | null
  metadataJson?: unknown
  createdAt?: string
  updatedAt?: string | null
}

export interface DepartmentTreeNodeResponse extends DepartmentResponse {
  children: DepartmentTreeNodeResponse[]
}

export interface DepartmentCreate {
  code: string
  name: string
  type?: string
  level?: number
  parentId?: number | null
  status?: string
  description?: string | null
  startDate?: string | null
  endDate?: string | null
}

export interface DepartmentUpdate extends Partial<DepartmentCreate> {}

export const DEPARTMENT_TYPE_OPTIONS = [
  { value: "Ban", label: "Ban" },
  { value: "Khối", label: "Khối" },
  { value: "Phòng", label: "Phòng" },
  { value: "Bộ phận", label: "Bộ phận" },
  { value: "Nhóm", label: "Nhóm" },
  { value: "Department", label: "Department" },
]
