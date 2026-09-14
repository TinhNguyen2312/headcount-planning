export type MilestoneDependencyType =
  | "FINISH_TO_START"
  | "START_TO_START"
  | "FINISH_TO_FINISH"
  | "START_TO_FINISH"

export interface MilestoneQueryParams {
  keyword?: string
  page?: number
  limit?: number
  sortBy?: string
  order?: "ASC" | "DESC" | string
  isActive?: boolean | string
}

export interface MilestoneDependencyResponse {
  id: number
  fromMilestoneId: number
  toMilestoneId: number
  dependencyType: MilestoneDependencyType
  description?: string | null
  createdAt?: string
}

export interface MilestoneSimple {
  id: number
  code: string
  name: string
  dependencyType: MilestoneDependencyType
}

export interface MilestoneResponse {
  id: number
  code: string
  name: string
  description?: string | null
  isActive: boolean
  createdAt: string
  predecessorIds?: number[]
  predecessors?: MilestoneSimple[]
  successorIds?: number[]
  successors?: MilestoneSimple[]
}

export interface MilestoneCreate {
  code: string
  name: string
  description?: string | null
  isActive?: boolean
  predecessorIds?: number[]
}

export interface MilestoneUpdate extends Partial<MilestoneCreate> {}

export interface MilestoneDependencyCreate {
  fromMilestoneId: number
  toMilestoneId: number
  dependencyType?: MilestoneDependencyType
  description?: string | null
}
