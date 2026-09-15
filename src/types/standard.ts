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

export type StandardProjectType = "ALL" | "LOW_RISE" | "HIGH_RISE" | "MIXED"

export const STANDARD_PROJECT_TYPE_OPTIONS: {
  value: StandardProjectType
  label: string
  description: string
}[] = [
  {
    value: "ALL",
    label: "Tất cả loại hình",
    description: "Áp dụng cho mọi dự án không phân biệt loại hình",
  },
  {
    value: "LOW_RISE",
    label: "Chỉ Thấp tầng",
    description: "Chỉ áp dụng khi dự án có hạng mục Thấp tầng",
  },
  {
    value: "HIGH_RISE",
    label: "Chỉ Cao tầng",
    description: "Chỉ áp dụng khi dự án có hạng mục Cao tầng",
  },
  {
    value: "MIXED",
    label: "Dự án thấp tầng và cao tầng",
    description: "Chỉ áp dụng khi dự án có đồng thời cả Thấp tầng và Cao tầng",
  },
]

export const STANDARD_PROJECT_TYPE_LABELS: Record<StandardProjectType, string> =
  {
    ALL: "Tất cả",
    LOW_RISE: "Thấp tầng",
    HIGH_RISE: "Cao tầng",
    MIXED: "Hỗn hợp",
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
  fromLeadTimeMonths: number
  toLeadTimeMonths: number
  durationMonths: number
  monthlyFactors: number[]
  projectType: StandardProjectType
  criteriaCount?: number
  criteria?: HeadcountCriteriaResponse[]
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
  fromLeadTimeMonths?: number
  toLeadTimeMonths?: number
  durationMonths?: number
  monthlyFactors?: number[]
  projectType?: StandardProjectType
  criteria?: HeadcountCriteriaInput[]
}

export interface HeadcountStandardUpdatePayload {
  roleId?: number
  fromMilestoneId?: number
  toMilestoneId?: number | null
  headcount?: number
  headcountMin?: number | null
  headcountMax?: number | null
  note?: string | null
  fromLeadTimeMonths?: number
  toLeadTimeMonths?: number
  durationMonths?: number
  monthlyFactors?: number[]
  projectType?: StandardProjectType
  criteria?: HeadcountCriteriaInput[]
}

export interface HeadcountStandardQueryParams {
  roleId?: number
  fromMilestoneId?: number
  toMilestoneId?: number
  projectType?: StandardProjectType
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
