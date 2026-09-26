import { IBaseQuery } from "./common"
import type { RequirementType } from "./taskItem"

export type ChecklistItemStatus = "PENDING" | "REJECTED" | "ACCEPTED" | "NA"
export type ChecklistRequirementType = RequirementType | "none"

export interface ChecklistQueryParams extends IBaseQuery {
  taskItemId?: number
}

export interface ChecklistResponse {
  id: number
  taskItemId: number | null
  taskItemTitle?: string | null
  code: string
  name: string
  description: string | null
  custodianDepartment?: string | null
  recipients?: string | null
  isActive?: boolean
  createdAt: string
  updatedAt?: string | null
}

export interface ChecklistCreate {
  taskItemId: number | null
  code: string
  name: string
  description?: string | null
  custodianDepartment?: string | null
  recipients?: string | null
}

export type ChecklistUpdate = Partial<ChecklistCreate>

export interface ChecklistItemResponse {
  id: number
  checklistId?: number
  parentId: number | null
  title: string
  checkingMethod?: string | null
  orderIndex?: number | null
  requirementType?: RequirementType | null
  createdAt?: string
  updatedAt?: string | null
}

export interface ChecklistItemTreeNodeResponse extends ChecklistItemResponse {
  children: ChecklistItemTreeNodeResponse[]
}

export interface ChecklistItemCreate {
  title: string
  checkingMethod?: string | null
  orderIndex?: number | null
  requirementType?: RequirementType | null
  parentId?: number | null
}

export interface ChecklistItemUpdate extends Partial<ChecklistItemResponse> {}

export interface ChecklistItemReorderEntry {
  id: number
  orderIndex: number
}

export interface ReorderChecklistItemsRequest {
  items: ChecklistItemReorderEntry[]
}

export interface ChecklistInstanceResponse {
  id: number
  checklist: ChecklistResponse
  taskInstanceId: number
  contractorNames: string[]
  comment: string | null
  createdAt: string
}

export interface ChecklistInstanceCreate {
  checklistId: number
  contractorNames?: string[]
  comment?: string | null
}

export interface ChecklistInstanceItemResponse {
  id: number
  parentId: number | null
  checklistItem: {
    id: number
    checklistId: number
    parentId: number | null
    title: string
    checkingMethod: string | null
    requirementType: RequirementType | null
  }
  status: ChecklistItemStatus
  reasonDescription: string | null
  requirements: string[]
}

export interface ChecklistInstanceItemTreeNodeResponse
  extends ChecklistInstanceItemResponse {
  children: ChecklistInstanceItemTreeNodeResponse[]
}

export interface ChecklistInstanceItemUpdate {
  status: ChecklistItemStatus
  reasonDescription?: string | null
  requirements?: string[]
}

export interface ParsedChecklistItem {
  id: string
  orderIndex: number
  title: string
  checkingMethod: string
  requirementType: ChecklistRequirementType
  notes?: string
}

export interface ParsedChecklistTemplate {
  sheetName: string
  code: string
  name: string
  description: string
  custodianDepartment?: string
  recipients?: string
  taskItemId?: number | null
  items: ParsedChecklistItem[]
}

export interface ImportChecklistProgress {
  totalTemplates: number
  completedTemplates: number
  totalItems: number
  completedItems: number
  currentSheetName: string
  status: "idle" | "importing" | "success" | "error"
  errorMessages: string[]
}
