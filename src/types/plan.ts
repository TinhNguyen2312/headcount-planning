import { MilestoneResponse } from "./milestone"

export type PlanStatus = "DRAFT" | "ACTIVE" | "ARCHIVED"

export interface PhaseResponse {
  id: number
  planId: number
  orderIndex: number
  milestoneId: number
  startDate: string
  endDate: string
  durationMonths: number
  description: string | null
  createdAt: string
  milestone?: {
    id: number
    code?: string | null
    name?: string | null
    description?: string | null
  } | null
  updatedAt?: string
  durationDays?: number
}

export interface PhaseInput {
  id?: number
  orderIndex: number
  milestoneId: number
  startDate: string
  endDate: string
  durationMonths?: number
  description?: string | null
}

export interface PlanResponse {
  id: number
  projectId: number
  versionName: string
  status: PlanStatus
  validFrom: string
  note: string | null
  createdAt: string
  updatedAt: string
  phases: PhaseResponse[]
  phasesCount?: number
}

export interface PlanCreatePayload {
  versionName: string
  validFrom: string
  note?: string | null
  cloneFromPlanId?: number
  phases?: PhaseInput[]
}

export interface PlanUpdatePayload {
  versionName?: string
  validFrom?: string
  note?: string | null
  phases?: PhaseInput[]
}
