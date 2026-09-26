import type { TaskInstanceStageStatus } from "@/types"

export type StageStatusTabValue = "ALL" | TaskInstanceStageStatus

export interface SubordinateEmployee {
  id: number
  name: string
  initials: string
  title: string
  department: string
  phone: string
  email: string
  perNumber?: string | null
}

export interface SubordinateTreeNode extends SubordinateEmployee {
  childrenCount?: number
  children: SubordinateTreeNode[]
}

export interface SubordinateQueryFilters {
  projectId?: number
  userId?: number
  workDate?: string
  stageStatus?: TaskInstanceStageStatus
  page?: number
  limit?: number
}
