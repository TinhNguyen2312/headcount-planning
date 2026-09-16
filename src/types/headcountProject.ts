import type { ProjectResponse } from "./project"

export interface HeadcountProjectResponse {
  id: number
  projectId: number
  isActive: boolean
  note: string | null
  createdAt: string
  updatedAt: string
  project: ProjectResponse
}

export interface HeadcountProjectCreatePayload {
  projectId: number
  isActive?: boolean
  note?: string | null
}

export interface HeadcountProjectUpdatePayload {
  isActive?: boolean
  note?: string | null
}

export interface HeadcountProjectQueryParams {
  keyword?: string
  isActive?: boolean
  regionId?: number
  sectorId?: number
  page?: number
  limit?: number
  sortBy?: string
  order?: "ASC" | "DESC" | string
}
