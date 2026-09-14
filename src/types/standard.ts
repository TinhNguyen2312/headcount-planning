import type { MilestoneResponse } from "./milestone"
import type { PropertyResponse } from "./property"
import type { RoleResponse } from "./role"

export type ConditionOperator = "=" | "<" | "<=" | ">" | ">=" | "BETWEEN"

export const CONDITION_OPERATOR_OPTIONS: {
  value: ConditionOperator
  label: string
  description: string
}[] = [
  { value: "=", label: "Bằng (=)", description: "Bằng chính xác giá trị" },
  {
    value: ">=",
    label: "Lớn hơn hoặc bằng (>=)",
    description: "Từ giá trị này trở lên",
  },
  {
    value: "<=",
    label: "Nhỏ hơn hoặc bằng (<=)",
    description: "Từ giá trị này trở xuống",
  },
  { value: ">", label: "Lớn hơn (>)", description: "Lớn hơn giá trị này" },
  { value: "<", label: "Nhỏ hơn (<)", description: "Nhỏ hơn giá trị này" },
  {
    value: "BETWEEN",
    label: "Trong khoảng (BETWEEN)",
    description: "Nằm trong khoảng từ Min đến Max",
  },
]

export interface HeadcountCriteriaResponse {
  id: number
  standardId: number
  propertyId: number
  conditionOperator: ConditionOperator
  minValue: number | null
  maxValue: number | null
  valueText: string | null
  note: string | null
  property: PropertyResponse
  createdAt?: string
  updatedAt?: string
}

export interface HeadcountCriteriaInput {
  id?: number
  propertyId: number
  conditionOperator: ConditionOperator
  minValue?: number | null
  maxValue?: number | null
  valueText?: string | null
  note?: string | null
}

export interface HeadcountMonthlyFactorItem {
  id?: number
  standardId?: number
  durationMonths: number
  monthNo: number
  factor: number
  createdAt?: string
  updatedAt?: string
}

export interface HeadcountMonthlyFactorInput {
  id?: number
  durationMonths: number
  monthNo: number
  factor: number
}

export interface MonthlyFactorCurve {
  durationMonths: number
  factors: Array<{
    id?: number
    monthNo: number
    factor: number
  }>
}

export interface HeadcountStandardResponse {
  id: number
  roleId: number
  role: RoleResponse
  fromMilestoneId: number
  fromMilestone: MilestoneResponse
  toMilestoneId: number | null
  toMilestone: MilestoneResponse | null
  headcount: number
  headcountMin: number | null
  headcountMax: number | null
  note: string | null
  criteriaCount?: number
  monthlyFactorCount?: number
  criteria?: HeadcountCriteriaResponse[]
  monthlyFactors?: HeadcountMonthlyFactorItem[]
  createdAt: string
  updatedAt: string
}

export interface HeadcountStandardCreatePayload {
  roleId: number
  fromMilestoneId: number
  toMilestoneId?: number | null
  headcount: number
  headcountMin?: number | null
  headcountMax?: number | null
  note?: string | null
  criteria?: HeadcountCriteriaInput[]
  monthlyFactors?: HeadcountMonthlyFactorInput[]
}

export interface HeadcountStandardUpdatePayload {
  roleId?: number
  fromMilestoneId?: number
  toMilestoneId?: number | null
  headcount?: number
  headcountMin?: number | null
  headcountMax?: number | null
  note?: string | null
  criteria?: HeadcountCriteriaInput[]
  monthlyFactors?: HeadcountMonthlyFactorInput[]
}

export interface HeadcountStandardQueryParams {
  roleId?: number
  fromMilestoneId?: number
  toMilestoneId?: number
  keyword?: string
  page?: number
  limit?: number
  sortBy?: string
  order?: "ASC" | "DESC" | string
}

export interface EvaluateStandardPayload {
  projectId: number
  roleId?: number
  roleIds?: number[]
}

export interface CriteriaMatchEvaluation {
  propertyId: number
  propertyCode: string
  propertyName: string
  conditionOperator: ConditionOperator
  expectedMin: number | null
  expectedMax: number | null
  expectedText?: string | null
  projectValue: number | string | null
  satisfied: boolean
}

export interface StandardMatchResult {
  roleId: number
  roleName: string
  standard: HeadcountStandardResponse | null
  matchedCriteria: CriteriaMatchEvaluation[]
  isMatch: boolean
}
