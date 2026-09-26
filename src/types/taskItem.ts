import type { ChecklistResponse } from "./checklist"
import { IBaseQuery } from "./common"

export type ApprovalLevel = 0 | 1 | 2
export type EscalateLevel = "LOW" | "MEDIUM" | "HIGH"
export type TaskType = "FREQUENCY" | "ADHOC"

export type RequirementType =
  | "FILE"
  | "IMAGE"
  | "VIDEO"
  | "DATA_ENTRY"
  | "CHECKBOX"
  | "NUMBER"

export {
  REQUIREMENT_TYPE_COLOR,
  REQUIREMENT_TYPE_LABEL,
  TASK_TYPE_COLOR,
  TASK_TYPE_LABEL,
} from "@/constants"

export interface TaskItemQueryParams extends IBaseQuery {
  workType?: string
  taskType?: TaskType
  roleId?: number
  parentTaskId?: number
}

export interface TaskItemResponse {
  id: number
  parentTaskId: number | null
  title: string
  description: string | null
  orderIndex: number
  workType: string | null
  taskType: TaskType | null
  slaHours: number | null
  approvalLevel: ApprovalLevel
  escalateLevel: EscalateLevel
  requirementType?: RequirementType | null
  label?: string | null
  dataType?: string | null
  unit?: string | null
  isRequired?: boolean
  minCount?: number | null
  accCondition?: string | null
  roleIds?: number[]
  createdBy?: number
  createdAt?: string
  updatedAt?: string | null
}

export interface TaskItemCreate {
  parentTaskId?: number | null
  title: string
  description?: string | null
  orderIndex?: number
  workType?: string | null
  taskType?: TaskType | null
  slaHours?: number | null
  approvalLevel?: ApprovalLevel
  escalateLevel?: EscalateLevel | null
  requirementType?: RequirementType | null
  label?: string | null
  dataType?: string | null
  unit?: string | null
  isRequired?: boolean
  minCount?: number | null
  accCondition?: string | null
  roleIds?: number[]
}

export type TaskItemUpdate = Partial<TaskItemCreate>

export interface TaskItemReorderItem {
  id: number
  orderIndex: number
}

export interface BusinessMatrixResponse extends TaskItemResponse {
  id: number
  roles: {
    roleId: number
    roleName: string
  }[]
  requirements: {
    requirementType: RequirementType
    label: string | null
  }[]
  children: BusinessMatrixResponse[]
  stt?: string
  checklists?: ChecklistResponse[]
  checklistTemplateIds?: number[]
}
