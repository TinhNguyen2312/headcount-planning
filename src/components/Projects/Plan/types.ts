import type { PhaseResponse, PlanStatus } from "@/types"

export type ExecutionType = "SEQUENTIAL" | "OVERLAPPING" | "PARALLEL"

export interface PhaseWithMetrics extends PhaseResponse {
  durationDays: number
  durationMonths: number
  executionType: ExecutionType
}

export interface ProjectPlanManagementProps {
  projectId: number
  projectStartDate?: string | null
  projectEndDate?: string | null
  viewOnly?: boolean
}

export const STATUS_TAG_COLORS: Record<
  PlanStatus,
  { color: string; label: string }
> = {
  ACTIVE: { color: "success", label: "ĐANG ÁP DỤNG" },
  DRAFT: { color: "processing", label: "BẢN NHÁP" },
  ARCHIVED: { color: "default", label: "LƯU TRỮ" },
}
