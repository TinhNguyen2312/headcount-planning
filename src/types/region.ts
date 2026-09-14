export interface RegionQueryParams {
  sectorId?: number
  keyword?: string
  page?: number
  limit?: number
  sortBy?: string
  order?: "ASC" | "DESC" | string
}

export interface RegionResponse {
  id: number
  sectorId: number
  code?: string | null
  name: string
  description?: string | null
  createdAt: string
  sectorName?: string | null
  sectorCode?: string | null
}

export interface RegionDetail extends RegionResponse {}

export interface RegionCreate {
  sectorId: number
  code?: string | null
  name: string
  description?: string | null
}

export interface RegionUpdate extends Partial<RegionCreate> {}
