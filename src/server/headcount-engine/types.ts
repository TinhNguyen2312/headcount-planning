import type {
  DepartmentResponse,
  PlanningMethod,
  ProjectResponse,
  RegionResponse,
  RoleResponse,
} from "@/types"

export interface HeadcountCalculationParams {
  scopeType: PlanningMethod
  scopeId: string | number
  fromMonth: string // Format "MM/YYYY", ví dụ "01/2026"
  durationMonths?: number // Mặc định 6 tháng
}

export interface MonthPeriod {
  monthIndex: number // 1..6
  monthLabel: string // "T01/2026"
  year: number
  month: number // 1..12
  startDateStr: string // "YYYY-MM-DD"
  endDateStr: string // "YYYY-MM-DD"
}

export interface MonthlyHeadcountCell {
  monthIndex: number
  monthLabel: string
  standardHeadcount: number
  actualHeadcount: number
  surplus: number
  shortage: number
}

export interface MatrixRowItem {
  id: string
  isSubTotal?: boolean
  project?:
    | (Omit<ProjectResponse, "region"> & { region?: RegionResponse | null })
    | null
  region?: RegionResponse | null
  role: RoleResponse & { department?: DepartmentResponse | null }
  months: MonthlyHeadcountCell[]
}

export interface HeadcountReportResult {
  scopeType: PlanningMethod
  scopeId: string | number
  scopeName: string
  fromMonth: string
  toMonth: string
  monthsLabel: string[]
  rows: MatrixRowItem[]
  summary: {
    totalStandard: number
    totalActual: number
    totalSurplus: number
    totalShortage: number
    fulfillmentRate: number
  }
}
