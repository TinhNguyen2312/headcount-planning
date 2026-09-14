export interface SectorQueryParams {
  keyword?: string
  page?: number
  limit?: number
  sortBy?: string
  order?: "ASC" | "DESC" | string
}

export interface SectorResponse {
  id: number
  code?: string | null
  name: string
  description?: string | null
  createdAt: string
}

export interface SectorCreate {
  code?: string | null
  name: string
  description?: string | null
}

export interface SectorUpdate extends Partial<SectorCreate> {}
